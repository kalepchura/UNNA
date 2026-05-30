// backend/src/modules/fallas/services/fallas-soldadura-inox.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  FallasSoldaduraInoxRepository,
  FiltrosResueltosFSI,
} from '../repositories/fallas-soldadura-inox.repository';
import { CrearFallaSoldaduraInoxDto } from '../dto/falla-soldadura-inox/crear-falla-soldadura-inox.dto';
import { ActualizarFallaSoldaduraInoxDto } from '../dto/falla-soldadura-inox/actualizar-falla-soldadura-inox.dto';
import { FiltrarFallasSoldaduraInoxDto } from '../dto/falla-soldadura-inox/filtrar-fallas-soldadura-inox.dto';
import { FallaSoldaduraInoxResponseDto } from '../dto/falla-soldadura-inox/falla-soldadura-inox-response.dto';
import { FallaSoldaduraInox } from '../entities/falla-soldadura-inox.entity';

import { AuditoriaService } from '../../auditoria/services/auditoria.service';
import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

import { CambiaviasService } from '../../catalogos/cambiavias/services/cambiavias.service';

// Services analíticos (para invalidar caché en cambios)
import { KpisFallasService } from './kpis-fallas.service';
import { Grafico1FallasService } from './grafico-1-fallas.service';
import { Grafico2FallasService } from './grafico-2-fallas.service';
import { Grafico3FallasService } from './grafico-3-fallas.service';

/**
 * ============================================================
 * FallasSoldaduraInoxService
 * ============================================================
 * Lógica de negocio para FallaSoldaduraInox.
 *
 * Diferencias clave vs FallaRiel:
 *  - El usuario selecciona un cambiavía (por ID, desde dropdown)
 *  - NO se calcula contexto geográfico: se hereda del cambiavía
 *    vía FK (tramo, curvas, velocidad, vía, progresiva)
 *  - Validamos que el cambiavía exista al crear/actualizar
 *
 * 🎯 Filtros: el frontend envía IDs directamente (no códigos).
 * Sin traducciones, sin N+1, sin acceso a repos internos.
 *
 * Misma arquitectura que FallaRielService para mantener
 * consistencia y escalabilidad.
 * ============================================================
 */
@Injectable()
export class FallasSoldaduraInoxService {
  private readonly NOMBRE_ENTIDAD = 'FallaSoldaduraInox';

  constructor(
    private readonly fallasRepo: FallasSoldaduraInoxRepository,
    private readonly cambiaviasService: CambiaviasService,
    private readonly auditoria: AuditoriaService,
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
  ): Promise<FallaSoldaduraInoxResponseDto> {
    const f = await this.fallasRepo.buscarPorId(id, incluirEliminadas);
    if (!f) {
      throw new NotFoundException(`FallaSoldaduraInox ${id} no encontrada`);
    }
    return FallaSoldaduraInoxResponseDto.fromEntity(f);
  }

  async listar(filtros: FiltrarFallasSoldaduraInoxDto) {
    return this.listarInterno(filtros, false);
  }

  async listarEliminados(filtros: FiltrarFallasSoldaduraInoxDto) {
    return this.listarInterno(filtros, true);
  }

  /**
   * ✨ Listado unificado. Recibe IDs directamente del frontend,
   * cero traducción de códigos, cero N+1.
   */
  private async listarInterno(
    filtros: FiltrarFallasSoldaduraInoxDto,
    soloEliminados: boolean,
  ) {
    const filtrosResueltos: FiltrosResueltosFSI = {
      cambiaviaIds: filtros.cambiaviaIds,
      tramoIds: filtros.tramoIds,
      via: filtros.via,
      ubicacionFalla: filtros.ubicacionFalla,
      acciones: filtros.acciones,
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
      data: fallas.map((f) => FallaSoldaduraInoxResponseDto.fromEntity(f)),
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
    dto: CrearFallaSoldaduraInoxDto,
    user: AuthenticatedUser,
  ): Promise<FallaSoldaduraInoxResponseDto> {
    // 1. Validar que el cambiavía existe (lanza 404 si no)
    const cambiavia = await this.cambiaviasService.obtenerPorId(dto.cambiaviaId);

    // 2. Persistir la falla
    const creada = await this.fallasRepo.crear({
      cambiaviaId: cambiavia.id,
      fechaDeteccion: new Date(dto.fechaDeteccion),
      ubicacionFalla: dto.ubicacionFalla,
      accion: dto.accion,
      observacion: dto.observacion ?? null,
      ensayo: dto.ensayo ?? null,
      pt: dto.pt ?? null,
      creadoPor: user.id,
      actualizadoPor: null,
      eliminado: false,
      eliminadoPorId: null,
    });

    // 3. Registrar en auditoría
    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(creada.id),
      operacion: OperacionAuditoria.CREATE,
      user,
      detalle: {
        cambiaviaId: cambiavia.id,
        accion: dto.accion,
        ubicacionFalla: dto.ubicacionFalla,
      },
    });


    // 4. Recargar con JOINs para el response
    const conJoins = await this.fallasRepo.buscarPorId(creada.id);
    return FallaSoldaduraInoxResponseDto.fromEntity(conJoins!);
  }

  // ----------------------------------------------------------
  // ACTUALIZAR
  // ----------------------------------------------------------

  async actualizar(
    id: number,
    dto: ActualizarFallaSoldaduraInoxDto,
    user: AuthenticatedUser,
  ): Promise<FallaSoldaduraInoxResponseDto> {
    const falla = await this.fallasRepo.buscarPorId(id);
    if (!falla) {
      throw new NotFoundException(`FallaSoldaduraInox ${id} no encontrada`);
    }

    const cambios: Partial<FallaSoldaduraInox> = {
      actualizadoPor: user.id,
    };

    // Si cambia el cambiavía, validar que el nuevo existe
    if (dto.cambiaviaId !== undefined) {
      const cv = await this.cambiaviasService.obtenerPorId(dto.cambiaviaId);
      cambios.cambiaviaId = cv.id;
    }

    if (dto.fechaDeteccion !== undefined) {
      cambios.fechaDeteccion = new Date(dto.fechaDeteccion);
    }
    if (dto.ubicacionFalla !== undefined) cambios.ubicacionFalla = dto.ubicacionFalla;
    if (dto.accion !== undefined) cambios.accion = dto.accion;
    if (dto.observacion !== undefined) cambios.observacion = dto.observacion;
    if (dto.ensayo !== undefined) cambios.ensayo = dto.ensayo;
    if (dto.pt !== undefined) cambios.pt = dto.pt;

    await this.fallasRepo.actualizar(falla, cambios);

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.UPDATE,
      user,
      detalle: { camposCambiados: Object.keys(dto) },
    });


    const actualizada = await this.fallasRepo.buscarPorId(id);
    return FallaSoldaduraInoxResponseDto.fromEntity(actualizada!);
  }

  // ----------------------------------------------------------
  // ELIMINAR (soft delete)
  // ----------------------------------------------------------

  async eliminar(id: number, user: AuthenticatedUser): Promise<void> {
    const falla = await this.fallasRepo.buscarPorId(id);
    if (!falla) {
      throw new NotFoundException(`FallaSoldaduraInox ${id} no encontrada`);
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
      detalle: { cambiaviaId: falla.cambiaviaId },
    });


  }

  // ----------------------------------------------------------
  // RESTAURAR
  // ----------------------------------------------------------

  async restaurar(id: number, user: AuthenticatedUser): Promise<void> {
    const falla = await this.fallasRepo.buscarPorId(id, true);
    if (!falla) {
      throw new NotFoundException(`FallaSoldaduraInox ${id} no encontrada`);
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

  }

  // ----------------------------------------------------------
  // AUDITORÍA (página de admin)
  // ----------------------------------------------------------

  async contarEliminados(): Promise<number> {
    return this.fallasRepo.contarEliminados();
  }

  

}