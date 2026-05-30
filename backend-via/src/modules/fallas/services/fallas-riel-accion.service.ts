import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { FallasRielAccionRepository } from '../repositories/fallas-riel-accion.repository';
import { FallasRielRepository } from '../repositories/fallas-riel.repository';

import { CrearAccionRielDto } from '../dto/accion-riel/crear-accion-riel.dto';
import { ActualizarAccionRielDto } from '../dto/accion-riel/actualizar-accion-riel.dto';
import { AccionRielResponseDto } from '../dto/accion-riel/accion-riel-response.dto';

import { FallaRielAccion } from '../entities/falla-riel-accion.entity';
import { FallaRiel } from '../entities/falla-riel.entity';

import {
  EstadoFalla,
} from '../../../common/enums';

import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

// SOLO KPIs usan caché real
import { KpisFallasService } from './kpis-fallas.service';

/**
 * ============================================================
 * FallasRielAccionService
 * ============================================================
 * Gestión del historial de intervenciones de una FallaRiel.
 *
 * RESPONSABILIDAD CRÍTICA:
 * Mantener sincronizados los campos desnormalizados:
 *
 *   - estadoActual
 *   - accionActual
 *   - ptActual
 *   - fechaEjecucionActual
 *
 * Estos campos SIEMPRE representan la acción activa
 * más reciente de la falla.
 *
 * REGLA:
 *
 * estadoActual =
 * última acción activa ordenada por:
 *
 *   fechaEjecucion DESC NULLS LAST
 *   id DESC
 *
 * ARQUITECTURA ANALÍTICA:
 *
 * - KPIs → usan caché → requieren invalidación
 * - Gráficos → NO usan caché → consultan BD directamente
 *
 * ============================================================
 */
@Injectable()
export class FallasRielAccionService {

  constructor(
    private readonly accionesRepo: FallasRielAccionRepository,

    private readonly fallasRepo: FallasRielRepository,

    // SOLO KPIs mantienen cache real
    private readonly kpisService: KpisFallasService,
  ) {}

  // ==========================================================
  // CONSULTAS
  // ==========================================================

  /**
   * Lista timeline completo de acciones de una falla.
   */
  async listarPorFalla(
    fallaId: number,
    incluirEliminadas = false,
  ): Promise<AccionRielResponseDto[]> {

    const falla = await this.fallasRepo.buscarPorId(
      fallaId,
      true,
    );

    if (!falla) {
      throw new NotFoundException(
        `FallaRiel con id ${fallaId} no encontrada`,
      );
    }

    const acciones =
      await this.accionesRepo.listarPorFalla(
        fallaId,
        incluirEliminadas,
      );

    return acciones.map((a) =>
      AccionRielResponseDto.fromEntity(a),
    );
  }

  async obtenerPorId(
    id: number,
  ): Promise<AccionRielResponseDto> {

    const accion =
      await this.accionesRepo.buscarPorId(id);

    if (!accion) {
      throw new NotFoundException(
        `Acción con id ${id} no encontrada`,
      );
    }

    return AccionRielResponseDto.fromEntity(accion);
  }

  // ==========================================================
  // CREAR
  // ==========================================================

  async crear(
    fallaId: number,
    dto: CrearAccionRielDto,
    user: AuthenticatedUser,
  ): Promise<AccionRielResponseDto> {

    // No permitir acciones sobre fallas eliminadas
    const falla = await this.fallasRepo.buscarPorId(
      fallaId,
    );

    if (!falla) {
      throw new NotFoundException(
        `FallaRiel con id ${fallaId} no encontrada o eliminada`,
      );
    }

    const creada = await this.accionesRepo.crear({
      fallaId,

      accion: dto.accion,

      pt: dto.pt ?? null,

      fechaEjecucion: dto.fechaEjecucion
        ? new Date(dto.fechaEjecucion)
        : null,

      conclusion: dto.conclusion,

      observaciones: dto.observaciones ?? null,

      creadoPor: user.id,

      actualizadoPor: null,

      eliminado: false,

      eliminadoPorId: null,
    });

    // Recalcular estado desnormalizado
    await this.sincronizarEstadoFalla(
      fallaId,
      user,
    );

    // SOLO invalidar KPIs
    this.invalidarCacheAnalitico();

    return AccionRielResponseDto.fromEntity(
      creada,
    );
  }

  // ==========================================================
  // ACTUALIZAR
  // ==========================================================

  async actualizar(
    id: number,
    dto: ActualizarAccionRielDto,
    user: AuthenticatedUser,
  ): Promise<AccionRielResponseDto> {

    const accion =
      await this.accionesRepo.buscarPorId(id);

    if (!accion) {
      throw new NotFoundException(
        `Acción con id ${id} no encontrada`,
      );
    }

    const cambios: Partial<FallaRielAccion> = {

      ...(dto.accion !== undefined && {
        accion: dto.accion,
      }),

      ...(dto.pt !== undefined && {
        pt: dto.pt,
      }),

      ...(dto.fechaEjecucion !== undefined && {
        fechaEjecucion: dto.fechaEjecucion
          ? new Date(dto.fechaEjecucion)
          : null,
      }),

      ...(dto.conclusion !== undefined && {
        conclusion: dto.conclusion,
      }),

      ...(dto.observaciones !== undefined && {
        observaciones: dto.observaciones,
      }),

      actualizadoPor: user.id,
    };

    await this.accionesRepo.actualizar(
      accion,
      cambios,
    );

    // Recalcular SIEMPRE por seguridad
    await this.sincronizarEstadoFalla(
      accion.fallaId,
      user,
    );

    // SOLO invalidar KPIs
    this.invalidarCacheAnalitico();

    const actualizada =
      await this.accionesRepo.buscarPorId(id);

    return AccionRielResponseDto.fromEntity(
      actualizada!,
    );
  }

  // ==========================================================
  // ELIMINAR (soft delete)
  // ==========================================================

  async eliminar(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {

    const accion =
      await this.accionesRepo.buscarPorId(id);

    if (!accion) {
      throw new NotFoundException(
        `Acción con id ${id} no encontrada`,
      );
    }

    if (accion.eliminado) {
      throw new BadRequestException(
        'La acción ya está eliminada',
      );
    }

    await this.accionesRepo.actualizar(
      accion,
      {
        eliminado: true,

        eliminadoPorId: user.id,

        actualizadoPor: user.id,
      },
    );

    // Recalcular estado actual
    await this.sincronizarEstadoFalla(
      accion.fallaId,
      user,
    );

    // SOLO invalidar KPIs
    this.invalidarCacheAnalitico();
  }

  // ==========================================================
  // RESTAURAR
  // ==========================================================

  async restaurar(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {

    const accion =
      await this.accionesRepo.buscarPorId(
        id,
        true,
      );

    if (!accion) {
      throw new NotFoundException(
        `Acción con id ${id} no encontrada`,
      );
    }

    if (!accion.eliminado) {
      throw new BadRequestException(
        'La acción no está eliminada',
      );
    }

    await this.accionesRepo.actualizar(
      accion,
      {
        eliminado: false,

        eliminadoPorId: null,

        actualizadoPor: user.id,
      },
    );

    await this.sincronizarEstadoFalla(
      accion.fallaId,
      user,
    );

    // SOLO invalidar KPIs
    this.invalidarCacheAnalitico();
  }

  // ==========================================================
  // SINCRONIZACIÓN DE ESTADO DESNORMALIZADO
  // ==========================================================

  /**
   * Recalcula:
   *
   * - estadoActual
   * - accionActual
   * - ptActual
   * - fechaEjecucionActual
   *
   * usando la acción activa más reciente.
   */
  async sincronizarEstadoFalla(
    fallaId: number,
    user: AuthenticatedUser,
  ): Promise<void> {

    const falla =
      await this.fallasRepo.buscarPorId(
        fallaId,
        true,
      );

    // Si ya no existe, no hay nada que sincronizar
    if (!falla) {
      return;
    }

    const masReciente =
      await this.accionesRepo.obtenerMasReciente(
        fallaId,
      );

    const nuevoEstado: Partial<FallaRiel> =
      masReciente
        ? {
            estadoActual: masReciente.conclusion,

            accionActual: masReciente.accion,

            ptActual: masReciente.pt,

            fechaEjecucionActual:
              masReciente.fechaEjecucion,

            actualizadoPor: user.id,
          }
        : {
            // Sin acciones activas
            estadoActual:
              EstadoFalla.NO_ATENDIDO,

            accionActual: null,

            ptActual: null,

            fechaEjecucionActual: null,

            actualizadoPor: user.id,
          };

    await this.fallasRepo.actualizar(
      falla,
      nuevoEstado,
    );
  }

  // ==========================================================
  // HELPERS PRIVADOS
  // ==========================================================

  /**
   * SOLO KPIs usan caché real.
   *
   * Los gráficos son stateless y
   * consultan directamente la BD.
   */
  private invalidarCacheAnalitico(): void {
    this.kpisService.invalidarCache();
  }
}