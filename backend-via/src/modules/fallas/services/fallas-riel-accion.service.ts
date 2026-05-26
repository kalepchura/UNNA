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

// Services analíticos (para invalidar caché cuando cambia el estadoActual)
import { KpisFallasService } from './kpis-fallas.service';
import { Grafico1FallasService } from './grafico-1-fallas.service';
import { Grafico2FallasService } from './grafico-2-fallas.service';
import { Grafico3FallasService } from './grafico-3-fallas.service';

/**
 * ============================================================
 * FallasRielAccionService
 * ============================================================
 * Lógica de gestión de intervenciones (FallaRielAccion).
 *
 * RESPONSABILIDAD CRÍTICA:
 * Mantener sincronizado el bloque de "estado actual" desnormalizado
 * en FallaRiel:
 *   - estadoActual
 *   - accionActual
 *   - ptActual
 *   - fechaEjecucionActual
 *
 * Estos campos se usan en listados y gráficos. NUNCA deben quedar
 * desactualizados respecto del historial real.
 *
 * Regla de sincronización:
 *   "estadoActual de FallaRiel = última FallaRielAccion (activa) por
 *    fechaEjecucion DESC NULLS LAST, id DESC"
 *
 * Por eso, cualquier mutación de acciones (CREATE, UPDATE, soft-DELETE,
 * RESTORE) termina llamando a sincronizarEstadoFalla(fallaId).
 *
 * AUDITORÍA:
 * Las acciones NO registran en AuditoriaLog porque no son una entidad
 * principal del sistema — son el historial interno de una falla.
 * La auditoría de la FallaRiel padre (CREATE/UPDATE/DELETE/RESTORE)
 * ya cubre el ciclo de vida de la falla. Los campos de AuditoriaBase
 * en la entidad (creadoEn, actualizadoEn, eliminado, eliminadoPorId)
 * son suficientes para trazabilidad interna.
 * ============================================================
 */
@Injectable()
export class FallasRielAccionService {
  constructor(
    private readonly accionesRepo: FallasRielAccionRepository,
    private readonly fallasRepo: FallasRielRepository,

    // Caché analítico: cambios de estadoActual afectan gráficos por estado
    private readonly kpisService: KpisFallasService,
    private readonly grafico1Service: Grafico1FallasService,
    private readonly grafico2Service: Grafico2FallasService,
    private readonly grafico3Service: Grafico3FallasService,
  ) {}

  // ==========================================================
  // CONSULTAS
  // ==========================================================

  /**
   * Lista el timeline de acciones de una falla, orden cronológico ascendente.
   * Excluye eliminadas (a menos que se llame con incluirEliminadas=true,
   * útil solo para administradores en página de auditoría).
   */
  async listarPorFalla(
    fallaId: number,
    incluirEliminadas = false,
  ): Promise<AccionRielResponseDto[]> {
    // Verificar que la falla exista (no validamos si está activa o no
    // porque el admin podría querer ver el historial de una falla eliminada)
    const falla = await this.fallasRepo.buscarPorId(fallaId, true);
    if (!falla) {
      throw new NotFoundException(`FallaRiel con id ${fallaId} no encontrada`);
    }

    const acciones = await this.accionesRepo.listarPorFalla(
      fallaId,
      incluirEliminadas,
    );
    return acciones.map((a) => AccionRielResponseDto.fromEntity(a));
  }

  async obtenerPorId(id: number): Promise<AccionRielResponseDto> {
    const accion = await this.accionesRepo.buscarPorId(id);
    if (!accion) {
      throw new NotFoundException(`Acción con id ${id} no encontrada`);
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
    // Validar que la falla existe Y está activa.
    // No permitimos agregar acciones a fallas eliminadas (soft-deleted),
    // porque sería incoherente con el estado del sistema.
    const falla = await this.fallasRepo.buscarPorId(fallaId);
    if (!falla) {
      throw new NotFoundException(
        `FallaRiel con id ${fallaId} no encontrada o eliminada`,
      );
    }

    const creada = await this.accionesRepo.crear({
      fallaId,
      accion: dto.accion,
      pt: dto.pt ?? null,
      fechaEjecucion: dto.fechaEjecucion ? new Date(dto.fechaEjecucion) : null,
      conclusion: dto.conclusion,
      observaciones: dto.observaciones ?? null,
      creadoPor: user.id,
      actualizadoPor: null,
      eliminado: false,
      eliminadoPorId: null,
    });

    // 🔄 SINCRONIZAR estado desnormalizado de la falla padre
    await this.sincronizarEstadoFalla(fallaId, user);

    this.invalidarCacheAnalitico();

    return AccionRielResponseDto.fromEntity(creada);
  }

  // ==========================================================
  // ACTUALIZAR
  // ==========================================================

  async actualizar(
    id: number,
    dto: ActualizarAccionRielDto,
    user: AuthenticatedUser,
  ): Promise<AccionRielResponseDto> {
    const accion = await this.accionesRepo.buscarPorId(id);
    if (!accion) {
      throw new NotFoundException(`Acción con id ${id} no encontrada`);
    }

    const cambios: Partial<FallaRielAccion> = {
      ...(dto.accion !== undefined && { accion: dto.accion }),
      ...(dto.pt !== undefined && { pt: dto.pt }),
      ...(dto.fechaEjecucion !== undefined && {
        fechaEjecucion: dto.fechaEjecucion ? new Date(dto.fechaEjecucion) : null,
      }),
      ...(dto.conclusion !== undefined && { conclusion: dto.conclusion }),
      ...(dto.observaciones !== undefined && { observaciones: dto.observaciones }),
      actualizadoPor: user.id,
    };

    await this.accionesRepo.actualizar(accion, cambios);

    // 🔄 SINCRONIZAR siempre, no solo cuando la editada es la más reciente.
    // ¿Por qué? Porque cambiar la fechaEjecucion puede cambiar CUÁL es la más
    // reciente (ej: una vieja recibe una fecha futura). Es más simple y seguro
    // recalcular siempre que tratar de detectar si el orden cambió.
    await this.sincronizarEstadoFalla(accion.fallaId, user);

    this.invalidarCacheAnalitico();

    const actualizada = await this.accionesRepo.buscarPorId(id);
    return AccionRielResponseDto.fromEntity(actualizada!);
  }

  // ==========================================================
  // ELIMINAR (soft delete)
  // ==========================================================

  async eliminar(id: number, user: AuthenticatedUser): Promise<void> {
    const accion = await this.accionesRepo.buscarPorId(id);
    if (!accion) {
      throw new NotFoundException(`Acción con id ${id} no encontrada`);
    }

    if (accion.eliminado) {
      throw new BadRequestException('La acción ya está eliminada');
    }

    await this.accionesRepo.actualizar(accion, {
      eliminado: true,
      eliminadoPorId: user.id,
      actualizadoPor: user.id,
    });

    // 🔄 SINCRONIZAR: si era la más reciente, ahora cuenta la anterior.
    // Si no quedan acciones activas, la falla vuelve a NO_ATENDIDO.
    await this.sincronizarEstadoFalla(accion.fallaId, user);

    this.invalidarCacheAnalitico();
  }

  // ==========================================================
  // RESTAURAR
  // ==========================================================

  async restaurar(id: number, user: AuthenticatedUser): Promise<void> {
    const accion = await this.accionesRepo.buscarPorId(id, true);
    if (!accion) {
      throw new NotFoundException(`Acción con id ${id} no encontrada`);
    }

    if (!accion.eliminado) {
      throw new BadRequestException('La acción no está eliminada');
    }

    await this.accionesRepo.actualizar(accion, {
      eliminado: false,
      eliminadoPorId: null,
      actualizadoPor: user.id,
    });

    await this.sincronizarEstadoFalla(accion.fallaId, user);

    this.invalidarCacheAnalitico();
  }

  // ==========================================================
  // SINCRONIZACIÓN DE ESTADO DESNORMALIZADO (PIEZA CLAVE)
  // ==========================================================

  /**
   * Recalcula los 4 campos desnormalizados de FallaRiel basándose
   * en la acción más reciente activa.
   *
   * Si no hay acciones activas → vuelve a NO_ATENDIDO con todos
   * los actual* en null. La falla "regresa" al estado inicial.
   *
   * Si hay al menos una acción activa → la más reciente define
   * los 4 valores actuales.
   *
   * Este método es público para que el FallasRielService también
   * pueda llamarlo en casos especiales (ej: tras restaurar una
   * falla soft-deleted, recalcular su estadoActual por consistencia).
   */
  async sincronizarEstadoFalla(
    fallaId: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const falla = await this.fallasRepo.buscarPorId(fallaId, true);
    if (!falla) {
      // No tiramos error: si la falla ya no existe (fue hard-deleted en algún
      // escenario excepcional), no hay nada que sincronizar.
      return;
    }

    const masReciente = await this.accionesRepo.obtenerMasReciente(fallaId);

    const nuevoEstado: Partial<FallaRiel> = masReciente
      ? {
          estadoActual: masReciente.conclusion,
          accionActual: masReciente.accion,
          ptActual: masReciente.pt,
          fechaEjecucionActual: masReciente.fechaEjecucion,
          actualizadoPor: user.id,
        }
      : {
          // No quedan acciones activas → estado inicial
          estadoActual: EstadoFalla.NO_ATENDIDO,
          accionActual: null,
          ptActual: null,
          fechaEjecucionActual: null,
          actualizadoPor: user.id,
        };

    await this.fallasRepo.actualizar(falla, nuevoEstado);
  }

  // ==========================================================
  // HELPERS PRIVADOS
  // ==========================================================

  /**
   * Cambios en acciones SÍ afectan analytics, porque el estadoActual
   * de FallaRiel cambió y los gráficos / KPIs que filtren por estado
   * deben recalcular.
   */
  private invalidarCacheAnalitico(): void {
    this.kpisService.invalidarCache();
    this.grafico1Service.invalidarCacheBase();
    this.grafico2Service.invalidarCacheBase();
    this.grafico3Service.invalidarCacheBase();
  }
}