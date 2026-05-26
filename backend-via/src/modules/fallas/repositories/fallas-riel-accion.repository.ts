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
 *  - eliminarPorFalla:      soft delete en cascada (cuando se elimina la falla padre)
 *  - restaurarPorFalla:     restaura acciones en cascada (cuando se restaura la falla padre)
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
  // CASCADE SOFT DELETE / RESTORE
  // ----------------------------------------------------------

  /**
   * Soft delete en cascada de todas las acciones activas de una falla.
   *
   * Se llama desde FallasRielService.eliminar() porque el onDelete: 'CASCADE'
   * de TypeORM solo se dispara con hard delete, no con soft delete.
   * Sin esto, al eliminar una falla sus acciones quedan con eliminado=false,
   * visualmente huérfanas y con estadoActual desincronizado.
   *
   * Solo afecta acciones con eliminado=false para no pisar registros
   * que ya estaban eliminados individualmente antes.
   */
  async eliminarPorFalla(
    fallaId: number,
    eliminadoPorId: string,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(FallaRielAccion)
      .set({
        eliminado: true,
        eliminadoPorId,
        actualizadoPor: eliminadoPorId,
      })
      .where('falla_id = :fallaId', { fallaId })
      .andWhere('eliminado = false')
      .execute();
  }

  /**
   * Restaura en cascada todas las acciones de una falla que fueron
   * eliminadas JUNTO CON la falla (eliminadoPorId coincide con quien
   * eliminó la falla).
   *
   * Por qué filtrar por eliminadoPorId:
   *  - Una acción puede haber sido eliminada individualmente antes de
   *    que se eliminara la falla. Esa acción NO debe restaurarse
   *    automáticamente, porque tenía su propia razón de existir eliminada.
   *  - Solo restauramos las que fueron eliminadas en cascada, es decir,
   *    las que tienen el mismo eliminadoPorId que la falla.
   *
   * Se llama desde FallasRielService.restaurar().
   */
  async restaurarPorFalla(
    fallaId: number,
    eliminadoPorId: string,
    actualizadoPor: string,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(FallaRielAccion)
      .set({
        eliminado: false,
        eliminadoPorId: null,
        actualizadoPor,
      })
      .where('falla_id = :fallaId', { fallaId })
      .andWhere('eliminado = true')
      .andWhere('eliminado_por_id = :eliminadoPorId', { eliminadoPorId })
      .execute();
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