// fallas-riel.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { StorageService, ArchivoMulter } from '../../../common/services/storage.service';
import { STORAGE_BUCKETS } from '../../../common/constants/storage-buckets';
import { FallasRielRepository, FiltrosResueltos } from '../repositories/fallas-riel.repository';
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
 *  - Soft delete y restauración
 *  - Gestión de archivos (informe interno / externo)
 *  - Registro de auditoría en cada operación
 *  - Invalidación de caché de KPIs/gráficos cuando cambian datos
 *
 * 🎯 Filtros: el frontend envía IDs directamente (no códigos).
 * Sin traducciones, sin N+1, sin acceso a repos internos.
 * ============================================================
 */
@Injectable()
export class FallasRielService {
  private readonly NOMBRE_ENTIDAD = 'FallaRiel';

  constructor(
    private readonly fallasRepo: FallasRielRepository,
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

  async obtenerPorId(
    id: number,
    incluirEliminadas = false,
  ): Promise<FallaRielResponseDto> {
    const falla = await this.fallasRepo.buscarPorId(id, incluirEliminadas);
    if (!falla) {
      throw new NotFoundException(`FallaRiel con id ${id} no encontrada`);
    }
    return FallaRielResponseDto.fromEntity(falla);
  }

  async listar(filtros: FiltrarFallasRielDto) {
    return this.listarInterno(filtros, false);
  }

  async listarEliminados(filtros: FiltrarFallasRielDto) {
    return this.listarInterno(filtros, true);
  }

  /**
   * ✨ Listado unificado. Recibe IDs directamente del frontend,
   * cero traducción de strings, cero N+1.
   */
  private async listarInterno(
    filtros: FiltrarFallasRielDto,
    soloEliminados: boolean,
  ) {
    const filtrosResueltos: FiltrosResueltos = {
      tramoIds: filtros.tramoIds,
      curvaHorizontalIds: filtros.curvaHorizontalIds,
      curvaVerticalIds: filtros.curvaVerticalIds,
      via: filtros.via,
      carril: filtros.carril,
      fechaDesde: filtros.fechaDesde,
      fechaHasta: filtros.fechaHasta,
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
      progresiva: dto.progresiva,
      via: dto.via,
      fecha: new Date(dto.fecha),
      carril: dto.carril,
      causa: dto.causa ?? null,
      origen: dto.origen ?? null,
      tramoId: contexto.tramoId,
      curvaHorizontalId: contexto.curvaHorizontalId,
      curvaVerticalId: contexto.curvaVerticalId,
      velocidadKmh: contexto.velocidadKmh,
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

    this.invalidarCacheAnalitico();

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

    const cambios: Partial<FallaRiel> = {
      ...(dto.progresiva !== undefined && { progresiva: dto.progresiva }),
      ...(dto.via !== undefined && { via: dto.via }),
      ...(dto.fecha !== undefined && { fecha: new Date(dto.fecha) }),
      ...(dto.carril !== undefined && { carril: dto.carril }),
      ...(dto.causa !== undefined && { causa: dto.causa }),
      ...(dto.origen !== undefined && { origen: dto.origen }),
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

    this.invalidarCacheAnalitico();

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

    await this.fallasRepo.actualizar(falla, {
      eliminado: true,
      eliminadoPorId: user.id,
      actualizadoPor: user.id,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.DELETE,
      user,
      detalle: { progresiva: falla.progresiva, via: falla.via },
    });

    this.invalidarCacheAnalitico();
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

    await this.fallasRepo.actualizar(falla, {
      eliminado: false,
      eliminadoPorId: null,
      actualizadoPor: user.id,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.RESTORE,
      user,
    });

    this.invalidarCacheAnalitico();
  }

  // ----------------------------------------------------------
  // ARCHIVOS (informe interno / externo)
  // ----------------------------------------------------------

  /**
   * 🚨 FIX RACE CONDITION:
   * Orden seguro: subir nuevo → actualizar BD → eliminar viejo.
   *
   * Si la subida falla, el archivo viejo sigue intacto.
   * Si la actualización de BD falla, el archivo nuevo queda
   * huérfano (lo limpia el job de limpieza), pero el viejo
   * sigue siendo válido.
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

    // 1. Subir el archivo nuevo PRIMERO (si falla, conservamos el viejo)
    const subcarpeta = `falla-${id}`;
    const subido = await this.storage.subir(bucket, archivo, subcarpeta);

    // 2. Actualizar BD con la nueva ruta
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
      // Si falla la BD, limpiamos el archivo recién subido (rollback manual)
      await this.storage.eliminar(bucket, subido.rutaStorage);
      throw err;
    }

    // 3. Recién ahora eliminamos el archivo viejo (la BD ya no lo referencia)
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

    // No invalidamos caché analítico: los archivos no afectan KPIs ni gráficos.

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

    // Actualizamos BD primero (si falla, el archivo sigue accesible)
    await this.fallasRepo.actualizar(falla, cambios);

    // Recién ahora eliminamos del storage
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
  // AUDITORÍA (página de admin)
  // ----------------------------------------------------------

  async contarEliminados(): Promise<number> {
    return this.fallasRepo.contarEliminados();
  }

  // ----------------------------------------------------------
  // HELPERS PRIVADOS
  // ----------------------------------------------------------

  /**
   * Mapea un tipo de archivo al bucket de Supabase correspondiente.
   */
  private bucketParaTipo(tipo: TipoArchivoFalla): string {
    return tipo === TipoArchivoFalla.INTERNO
      ? STORAGE_BUCKETS.FALLAS_RIEL_INTERNO
      : STORAGE_BUCKETS.FALLAS_RIEL_EXTERNO;
  }

  /**
   * Invalida toda la caché analítica cuando hay un cambio
   * en datos (crear/actualizar/eliminar/restaurar).
   *
   * Los archivos NO invocan este método porque no cambian
   * los datos de la falla, solo el adjunto.
   */
  private invalidarCacheAnalitico(): void {
    this.kpisService.invalidarCache();
    this.grafico1Service.invalidarCacheBase();
    this.grafico2Service.invalidarCacheBase();
    this.grafico3Service.invalidarCacheBase();
  }
}