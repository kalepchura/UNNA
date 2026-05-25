import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FallaRielAccion } from '../entities/falla-riel-accion.entity';

/**
 * ============================================================
 * FallasRielAccionRepository
 * ============================================================
 * Persistencia de acciones (intervenciones) sobre FallaRiel.
 *
 * Métodos:
 *  - listarPorFalla:        timeline cronológico (asc) de una falla
 *  - obtenerMasReciente:    la acción que define el estadoActual de la falla
 *  - buscarPorId:           detalle de una acción (con filtro de eliminadas)
 *  - crear / actualizar:    CRUD básico
 *  - contarPorFalla:        para validar reglas (ej: max acciones)
 *
 * REGLA DE ORDEN para "más reciente":
 *  - Primer criterio: fechaEjecucion DESC (NULLS LAST)
 *  - Desempate: id DESC (la última creada gana)
 *
 * Esto importa porque una acción puede registrarse sin fecha
 * (cuando recién se programa) y otra con fecha. La que TIENE
 * fecha y es la más reciente debe ganar sobre la que está NULL.
 * ============================================================
 */
@Injectable()
export class FallasRielAccionRepository {
  constructor(
    @InjectRepository(FallaRielAccion)
    private readonly repo: Repository<FallaRielAccion>,
  ) {}

  // ----------------------------------------------------------
  // LISTADO POR FALLA (timeline)
  // ----------------------------------------------------------

  /**
   * Devuelve TODAS las acciones de una falla, ordenadas
   * cronológicamente ascendente (la más antigua primero).
   *
   * Excluye eliminadas por defecto. Para auditoría del admin
   * pasar incluirEliminadas=true.
   */
  async listarPorFalla(
    fallaId: number,
    incluirEliminadas = false,
  ): Promise<FallaRielAccion[]> {
    const q = this.repo
      .createQueryBuilder('a')
      .where('a.falla_id = :fid', { fid: fallaId });

    if (!incluirEliminadas) {
      q.andWhere('a.eliminado = false');
    }

    return q
      .orderBy('a.fecha_ejecucion', 'ASC', 'NULLS FIRST')
      .addOrderBy('a.id', 'ASC')
      .getMany();
  }

  // ----------------------------------------------------------
  // ACCIÓN MÁS RECIENTE (sincronización de estado desnormalizado)
  // ----------------------------------------------------------

  /**
   * Devuelve la acción más reciente de una falla (activa, no eliminada).
   *
   * Esta acción define el estadoActual / accionActual / ptActual /
   * fechaEjecucionActual de la FallaRiel padre.
   *
   * Si no hay acciones activas, devuelve null. En ese caso el
   * service vuelve a setear FallaRiel a NO_ATENDIDO con nulls.
   */
  async obtenerMasReciente(fallaId: number): Promise<FallaRielAccion | null> {
    return this.repo
      .createQueryBuilder('a')
      .where('a.falla_id = :fid', { fid: fallaId })
      .andWhere('a.eliminado = false')
      // NULLS LAST: una acción con fecha le gana a una sin fecha.
      .orderBy('a.fecha_ejecucion', 'DESC', 'NULLS LAST')
      .addOrderBy('a.id', 'DESC')
      .limit(1)
      .getOne();
  }

  // ----------------------------------------------------------
  // BUSCAR POR ID
  // ----------------------------------------------------------

  /**
   * Busca una acción individual. Por defecto solo activas.
   *
   * NOTA: no carga la relación falla por defecto (eager: false).
   * Si la necesitas en el service para algo, hacé un leftJoin.
   */
  async buscarPorId(
    id: number,
    incluirEliminadas = false,
  ): Promise<FallaRielAccion | null> {
    const q = this.repo
      .createQueryBuilder('a')
      .where('a.id = :id', { id });

    if (!incluirEliminadas) {
      q.andWhere('a.eliminado = false');
    }

    return q.getOne();
  }

  // ----------------------------------------------------------
  // CRUD BÁSICO
  // ----------------------------------------------------------

  async crear(datos: Partial<FallaRielAccion>): Promise<FallaRielAccion> {
    const nueva = this.repo.create(datos);
    return this.repo.save(nueva);
  }

  async actualizar(
    accion: FallaRielAccion,
    cambios: Partial<FallaRielAccion>,
  ): Promise<FallaRielAccion> {
    Object.assign(accion, cambios);
    return this.repo.save(accion);
  }

  // ----------------------------------------------------------
  // UTILIDADES
  // ----------------------------------------------------------

  /**
   * Cuenta cuántas acciones activas tiene una falla.
   * Útil si más adelante se quiere imponer un máximo.
   */
  async contarPorFalla(fallaId: number): Promise<number> {
    return this.repo.count({
      where: { fallaId, eliminado: false },
    });
  }
}