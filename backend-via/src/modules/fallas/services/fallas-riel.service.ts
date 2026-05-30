// fallas-riel.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { StorageService, ArchivoMulter } from '../../../common/services/storage.service';
import { STORAGE_BUCKETS } from '../../../common/constants/storage-buckets';
import { FallasRielRepository, FiltrosResueltos } from '../repositories/fallas-riel.repository';
import { FallasRielAccionRepository } from '../repositories/fallas-riel-accion.repository';

import { CrearFallaRielDto } from '../dto/falla-riel/crear-falla-riel.dto';
import { ActualizarFallaRielDto } from '../dto/falla-riel/actualizar-falla-riel.dto';
import { FiltrarFallasRielDto } from '../dto/falla-riel/filtrar-fallas-riel.dto';
import { FallaRielResponseDto } from '../dto/falla-riel/falla-riel-response.dto';
import { FallaRiel } from '../entities/falla-riel.entity';

import { GeolocalizacionService } from '../../../common/services/geolocalizacion.service';
import { AuditoriaService } from '../../auditoria/services/auditoria.service';
import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';
import {
  ModuloAuditoria,
  OperacionAuditoria,
  TipoArchivoFalla,
  EstadoFalla,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

// Services analíticos (para invalidar caché en cambios)
import { KpisFallasService } from './kpis-fallas.service';
import { Grafico1FallasService } from './grafico-1-fallas.service';
import { Grafico2FallasService } from './grafico-2-fallas.service';
import { Grafico3FallasService } from './grafico-3-fallas.service';

/**
 * ============================================================
 * FallasRielService
 * ============================================================
 * Lógica de negocio para FallaRiel.
 *
 * Responsabilidades:
 *  - CRUD con cálculo automático de contexto geográfico
 *  - Propagar al persistir TODOS los campos descriptivos opcionales
 *    (tipoDefecto, elementoAfectado, etc.)
 *  - Soft delete y restauración — con CASCADE a acciones hijas
 *  - Gestión de archivos (informe interno / externo)
 *  - Registro de auditoría en cada operación
 *  - Invalidación de caché de KPIs/gráficos cuando cambian datos
 *  - Cargar acciones (historial) en el endpoint de detalle
 *
 * ⚠️ Importante: este service NO toca FallaRiel.estadoActual /
 * accionActual / ptActual / fechaEjecucionActual. Esos campos
 * son sincronizados exclusivamente por FallasRielAccionService.
 *
 * CASCADE SOFT DELETE:
 *  El onDelete: 'CASCADE' de TypeORM solo se dispara con hard delete.
 *  Para soft delete, propagamos manualmente a las acciones hijas
 *  usando accionesRepo.eliminarPorFalla() y restaurarPorFalla().
 * ============================================================
 */
@Injectable()
export class FallasRielService {
  private readonly NOMBRE_ENTIDAD = 'FallaRiel';

  constructor(
    private readonly fallasRepo: FallasRielRepository,
    private readonly accionesRepo: FallasRielAccionRepository,
    private readonly geolocalizacion: GeolocalizacionService,
    private readonly auditoria: AuditoriaService,
    private readonly storage: StorageService,
    private readonly kpisService: KpisFallasService,
    private readonly grafico1Service: Grafico1FallasService,
    private readonly grafico2Service: Grafico2FallasService,
    private readonly grafico3Service: Grafico3FallasService,
  ) {}

  // ----------------------------------------------------------
  // CONSULTAS
  // ----------------------------------------------------------

  /**
   * Detalle de una falla. Incluye el timeline de acciones (Fase 2).
   * Si la falla no tiene acciones, el array `acciones` viene vacío.
   */
  async obtenerPorId(
    id: number,
    incluirEliminadas = false,
  ): Promise<FallaRielResponseDto> {
    const falla = await this.fallasRepo.buscarPorId(id, incluirEliminadas);
    if (!falla) {
      throw new NotFoundException(`FallaRiel con id ${id} no encontrada`);
    }

    // Cargar acciones activas para el timeline (las eliminadas no se muestran en detalle
    const acciones = await this.accionesRepo.listarPorFalla(id, false);
    falla.acciones = acciones;

    return FallaRielResponseDto.fromEntity(falla, { incluirAcciones: true });
  }

  async listar(filtros: FiltrarFallasRielDto) {
    return this.listarInterno(filtros, false);
  }

  async listarEliminados(filtros: FiltrarFallasRielDto) {
    return this.listarInterno(filtros, true);
  }

  /**
   * Listado paginado. NO incluye acciones (sería costoso y no se necesita
   * en la vista de tabla). El listado lee los 4 campos desnormalizados
   * de FallaRiel para mostrar estado actual.
   */
  private async listarInterno(
    filtros: FiltrarFallasRielDto,
    soloEliminados: boolean,
  ) {
    const filtrosResueltos: FiltrosResueltos = {
      // Geográficos
      tramoIds: filtros.tramoIds,
      curvaHorizontalIds: filtros.curvaHorizontalIds,
      curvaVerticalIds: filtros.curvaVerticalIds,

      // Atributos simples
      via: filtros.via,
      carril: filtros.carril,

      // Temporales
      fechaDesde: filtros.fechaDesde,
      fechaHasta: filtros.fechaHasta,

      // ----- FASE 3: filtros por enum -----
      estadosActuales: filtros.estadosActuales,
      accionesActuales: filtros.accionesActuales,
      tipoDefectos: filtros.tipoDefectos,
      elementosAfectados: filtros.elementosAfectados,
      zonasAfectadas: filtros.zonasAfectadas,
      perfiles: filtros.perfiles,
      altasBajas: filtros.altasBajas,

      // Soft delete + paginación
      soloEliminados,
      page: filtros.page,
      limit: filtros.limit,
    };

    const [fallas, total] = await this.fallasRepo.listar(filtrosResueltos);
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    return {
      data: fallas.map((f) => FallaRielResponseDto.fromEntity(f)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ----------------------------------------------------------
  // CREAR
  // ----------------------------------------------------------

  async crear(
    dto: CrearFallaRielDto,
    user: AuthenticatedUser,
  ): Promise<FallaRielResponseDto> {
    const contexto = await this.geolocalizacion.calcular(dto.progresiva, dto.via);

    const creada = await this.fallasRepo.crear({
      // Originales
      progresiva: dto.progresiva,
      via: dto.via,
      fecha: new Date(dto.fecha),
      carril: dto.carril,
      causa: dto.causa ?? null,
      origen: dto.origen ?? null,

      // Caracterización (si vienen, se persisten; si no, default BD)
      ...(dto.tipoDefecto !== undefined && { tipoDefecto: dto.tipoDefecto }),
      ...(dto.elementoAfectado !== undefined && { elementoAfectado: dto.elementoAfectado }),
      ...(dto.zonaAfectada !== undefined && { zonaAfectada: dto.zonaAfectada }),
      ...(dto.perfil !== undefined && { perfil: dto.perfil }),
      ...(dto.altaBaja !== undefined && { altaBaja: dto.altaBaja }),

      // Medidas (nullables)
      progresivaFinal: dto.progresivaFinal ?? null,
      largo: dto.largo ?? null,
      ancho: dto.ancho ?? null,
      profundidad: dto.profundidad ?? null,
      numeroFoto: dto.numeroFoto ?? null,
      tipoOnda: dto.tipoOnda ?? null,

      // Estado desnormalizado inicial: NO_ATENDIDO con nulls
      estadoActual: EstadoFalla.NO_ATENDIDO,
      accionActual: null,
      ptActual: null,
      fechaEjecucionActual: null,

      // Contexto geográfico calculado
      tramoId: contexto.tramoId,
      curvaHorizontalId: contexto.curvaHorizontalId,
      curvaVerticalId: contexto.curvaVerticalId,
      velocidadKmh: contexto.velocidadKmh,

      // Auditoría
      creadoPor: user.id,
      actualizadoPor: null,
      eliminado: false,
      eliminadoPorId: null,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(creada.id),
      operacion: OperacionAuditoria.CREATE,
      user,
      detalle: {
        progresiva: dto.progresiva,
        via: dto.via,
        tramoId: contexto.tramoId,
      },
    });

    const conJoins = await this.fallasRepo.buscarPorId(creada.id);
    return FallaRielResponseDto.fromEntity(conJoins!);
  }

  // ----------------------------------------------------------
  // ACTUALIZAR
  // ----------------------------------------------------------

  async actualizar(
    id: number,
    dto: ActualizarFallaRielDto,
    user: AuthenticatedUser,
  ): Promise<FallaRielResponseDto> {
    const falla = await this.fallasRepo.buscarPorId(id);
    if (!falla) {
      throw new NotFoundException(`FallaRiel con id ${id} no encontrada`);
    }

    const recalcular =
      (dto.progresiva !== undefined && dto.progresiva !== falla.progresiva) ||
      (dto.via !== undefined && dto.via !== falla.via);

    let contextoNuevo: Partial<FallaRiel> = {};
    if (recalcular) {
      const nuevaProgresiva = dto.progresiva ?? falla.progresiva;
      const nuevaVia = dto.via ?? falla.via;
      const ctx = await this.geolocalizacion.calcular(nuevaProgresiva, nuevaVia);
      contextoNuevo = {
        tramoId: ctx.tramoId,
        curvaHorizontalId: ctx.curvaHorizontalId,
        curvaVerticalId: ctx.curvaVerticalId,
        velocidadKmh: ctx.velocidadKmh,
      };
    }

    // NOTA: los 4 campos del bloque "estado desnormalizado"
    // (estadoActual, accionActual, ptActual, fechaEjecucionActual)
    // NO se incluyen aquí. Eso es responsabilidad exclusiva del
    // FallasRielAccionService.
    const cambios: Partial<FallaRiel> = {
      // Originales
      ...(dto.progresiva !== undefined && { progresiva: dto.progresiva }),
      ...(dto.via !== undefined && { via: dto.via }),
      ...(dto.fecha !== undefined && { fecha: new Date(dto.fecha) }),
      ...(dto.carril !== undefined && { carril: dto.carril }),
      ...(dto.causa !== undefined && { causa: dto.causa }),
      ...(dto.origen !== undefined && { origen: dto.origen }),

      // Caracterización
      ...(dto.tipoDefecto !== undefined && { tipoDefecto: dto.tipoDefecto }),
      ...(dto.elementoAfectado !== undefined && { elementoAfectado: dto.elementoAfectado }),
      ...(dto.zonaAfectada !== undefined && { zonaAfectada: dto.zonaAfectada }),
      ...(dto.perfil !== undefined && { perfil: dto.perfil }),
      ...(dto.altaBaja !== undefined && { altaBaja: dto.altaBaja }),

      // Medidas
      ...(dto.progresivaFinal !== undefined && { progresivaFinal: dto.progresivaFinal }),
      ...(dto.largo !== undefined && { largo: dto.largo }),
      ...(dto.ancho !== undefined && { ancho: dto.ancho }),
      ...(dto.profundidad !== undefined && { profundidad: dto.profundidad }),
      ...(dto.numeroFoto !== undefined && { numeroFoto: dto.numeroFoto }),
      ...(dto.tipoOnda !== undefined && { tipoOnda: dto.tipoOnda }),

      ...contextoNuevo,
      actualizadoPor: user.id,
    };

    await this.fallasRepo.actualizar(falla, cambios);

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.UPDATE,
      user,
      detalle: {
        camposCambiados: Object.keys(dto),
        recalculoGeografico: recalcular,
      },
    });

    const actualizada = await this.fallasRepo.buscarPorId(id);
    return FallaRielResponseDto.fromEntity(actualizada!);
  }

  // ----------------------------------------------------------
  // ELIMINAR (soft delete)
  // ----------------------------------------------------------

  async eliminar(id: number, user: AuthenticatedUser): Promise<void> {
    const falla = await this.fallasRepo.buscarPorId(id);
    if (!falla) {
      throw new NotFoundException(`FallaRiel con id ${id} no encontrada`);
    }

    if (falla.eliminado) {
      throw new BadRequestException('La falla ya está eliminada');
    }

    // 1. Soft delete de la falla
    await this.fallasRepo.actualizar(falla, {
      eliminado: true,
      eliminadoPorId: user.id,
      actualizadoPor: user.id,
    });

    // 2. Cascade soft delete a todas las acciones activas de esta falla.
    //    Usamos user.id como eliminadoPorId para poder identificarlas
    //    en la restauración y no restaurar las que ya estaban eliminadas
    //    individualmente antes.
    await this.accionesRepo.eliminarPorFalla(id, user.id);

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.DELETE,
      user,
      detalle: { progresiva: falla.progresiva, via: falla.via },
    });
  }

  // ----------------------------------------------------------
  // RESTAURAR
  // ----------------------------------------------------------

  async restaurar(id: number, user: AuthenticatedUser): Promise<void> {
    const falla = await this.fallasRepo.buscarPorId(id, true);
    if (!falla) {
      throw new NotFoundException(`FallaRiel con id ${id} no encontrada`);
    }

    if (!falla.eliminado) {
      throw new BadRequestException('La falla no está eliminada');
    }

    // 1. Restaurar la falla
    await this.fallasRepo.actualizar(falla, {
      eliminado: false,
      eliminadoPorId: null,
      actualizadoPor: user.id,
    });

    // 2. Restaurar solo las acciones que fueron eliminadas EN CASCADA
    //    junto con la falla (las que tienen eliminadoPorId = falla.eliminadoPorId).
    //    Las que fueron eliminadas individualmente antes NO se restauran.
    if (falla.eliminadoPorId) {
      await this.accionesRepo.restaurarPorFalla(
        id,
        falla.eliminadoPorId,
        user.id,
      );
    }

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.RESTORE,
      user,
    });
  }

  // ----------------------------------------------------------
  // ARCHIVOS (informe interno / externo)
  // ----------------------------------------------------------

  /**
   * 🚨 FIX RACE CONDITION:
   * Orden seguro: subir nuevo → actualizar BD → eliminar viejo.
   */
  async adjuntarArchivo(
    id: number,
    tipo: TipoArchivoFalla,
    archivo: ArchivoMulter,
    user: AuthenticatedUser,
  ): Promise<FallaRielResponseDto> {
    const falla = await this.fallasRepo.buscarPorId(id);
    if (!falla) {
      throw new NotFoundException(`FallaRiel ${id} no encontrada`);
    }

    const bucket = this.bucketParaTipo(tipo);

    const rutaAnterior =
      tipo === TipoArchivoFalla.INTERNO
        ? falla.urlInformeInterno
        : falla.urlInformeExterno;

    const subcarpeta = `falla-${id}`;
    const subido = await this.storage.subir(bucket, archivo, subcarpeta);

    const cambios: Partial<FallaRiel> =
      tipo === TipoArchivoFalla.INTERNO
        ? {
            nombreInformeInterno: subido.nombreArchivo,
            urlInformeInterno: subido.rutaStorage,
            actualizadoPor: user.id,
          }
        : {
            nombreInformeExterno: subido.nombreArchivo,
            urlInformeExterno: subido.rutaStorage,
            actualizadoPor: user.id,
          };

    try {
      await this.fallasRepo.actualizar(falla, cambios);
    } catch (err) {
      await this.storage.eliminar(bucket, subido.rutaStorage);
      throw err;
    }

    if (rutaAnterior) {
      await this.storage.eliminar(bucket, rutaAnterior);
    }

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.UPDATE,
      user,
      detalle: { archivoSubido: tipo, nombre: subido.nombreArchivo },
    });

    const actualizada = await this.fallasRepo.buscarPorId(id);
    return FallaRielResponseDto.fromEntity(actualizada!);
  }

  async eliminarArchivo(
    id: number,
    tipo: TipoArchivoFalla,
    user: AuthenticatedUser,
  ): Promise<void> {
    const falla = await this.fallasRepo.buscarPorId(id);
    if (!falla) {
      throw new NotFoundException(`FallaRiel ${id} no encontrada`);
    }

    const bucket = this.bucketParaTipo(tipo);

    const ruta =
      tipo === TipoArchivoFalla.INTERNO
        ? falla.urlInformeInterno
        : falla.urlInformeExterno;

    if (!ruta) {
      throw new BadRequestException(`No hay archivo ${tipo} para eliminar`);
    }

    const cambios: Partial<FallaRiel> =
      tipo === TipoArchivoFalla.INTERNO
        ? {
            nombreInformeInterno: null,
            urlInformeInterno: null,
            actualizadoPor: user.id,
          }
        : {
            nombreInformeExterno: null,
            urlInformeExterno: null,
            actualizadoPor: user.id,
          };

    await this.fallasRepo.actualizar(falla, cambios);
    await this.storage.eliminar(bucket, ruta);

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.UPDATE,
      user,
      detalle: { archivoEliminado: tipo },
    });
  }

  async obtenerUrlArchivo(
    id: number,
    tipo: TipoArchivoFalla,
  ): Promise<{ url: string; nombre: string }> {
    const falla = await this.fallasRepo.buscarPorId(id);
    if (!falla) {
      throw new NotFoundException(`FallaRiel ${id} no encontrada`);
    }

    const bucket = this.bucketParaTipo(tipo);

    const ruta =
      tipo === TipoArchivoFalla.INTERNO
        ? falla.urlInformeInterno
        : falla.urlInformeExterno;
    const nombre =
      tipo === TipoArchivoFalla.INTERNO
        ? falla.nombreInformeInterno
        : falla.nombreInformeExterno;

    if (!ruta || !nombre) {
      throw new NotFoundException(`No hay archivo ${tipo} adjunto`);
    }

    const url = await this.storage.firmarUrl(bucket, ruta);
    return { url, nombre };
  }

  // ----------------------------------------------------------
  // AUDITORÍA
  // ----------------------------------------------------------

  async contarEliminados(): Promise<number> {
    return this.fallasRepo.contarEliminados();
  }

  // ----------------------------------------------------------
  // HELPERS PRIVADOS
  // ----------------------------------------------------------

  private bucketParaTipo(tipo: TipoArchivoFalla): string {
    return tipo === TipoArchivoFalla.INTERNO
      ? STORAGE_BUCKETS.FALLAS_RIEL_INTERNO
      : STORAGE_BUCKETS.FALLAS_RIEL_EXTERNO;
  }
}