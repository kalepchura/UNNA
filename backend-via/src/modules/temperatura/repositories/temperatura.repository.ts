import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Temperatura } from '../entities/temperatura.entity';

@Injectable()
export class TemperaturaRepository {
  constructor(
    @InjectRepository(Temperatura)
    private readonly repo: Repository<Temperatura>,
  ) {}

  /**
   * Inserción masiva en chunks de 1000 filas para evitar el límite
   * de parámetros de Postgres (~65535).
   *
   * Usa `manager.insert()` que ejecuta UN INSERT con múltiples VALUES,
   * mucho más rápido que un loop con save().
   */
  async insertarEnLoteEnTransaccion(
    manager: EntityManager,
    filas: Partial<Temperatura>[],
  ): Promise<number> {
    if (filas.length === 0) return 0;

    const TAMANIO_CHUNK = 1000;
    let totalInsertado = 0;

    for (let i = 0; i < filas.length; i += TAMANIO_CHUNK) {
      const chunk = filas.slice(i, i + TAMANIO_CHUNK);
      await manager.insert(Temperatura, chunk);
      totalInsertado += chunk.length;
    }

    return totalInsertado;
  }

  /**
   * Lista filas de una importación con paginación y filtros.
   * IMPORTANTE: el service que llama este método debe primero
   * verificar que la importación NO esté eliminada (soft delete).
   */
  async listarPorImportacion(
    importacionId: number,
    filtros: {
      fechaDesde?: string;
      fechaHasta?: string;
      temperaturaMin?: number;
      temperaturaMax?: number;
      page?: number;
      limit?: number;
    },
  ): Promise<[Temperatura[], number]> {
    const {
      fechaDesde, fechaHasta, temperaturaMin, temperaturaMax,
      page = 1, limit = 100,
    } = filtros;

    const q = this.repo
      .createQueryBuilder('t')
      .where('t.importacion_id = :id', { id: importacionId });

    if (fechaDesde) q.andWhere('t.fecha >= :fd', { fd: fechaDesde });
    if (fechaHasta) q.andWhere('t.fecha <= :fh', { fh: fechaHasta });
    if (temperaturaMin !== undefined) q.andWhere('t.temperatura >= :tmin', { tmin: temperaturaMin });
    if (temperaturaMax !== undefined) q.andWhere('t.temperatura <= :tmax', { tmax: temperaturaMax });

    q.orderBy('t.fecha', 'ASC')
      .addOrderBy('t.hora', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    return q.getManyAndCount();
  }
}