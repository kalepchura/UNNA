import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FallaSoldaduraInox } from '../entities/falla-soldadura-inox.entity';

/**
 * Filtros ya resueltos a IDs (los códigos los resuelve el service).
 */
export interface FiltrosResueltosFSI {
  cambiaviaIds?: number[];
  tramoIds?: number[];
  via?: string;
  ubicacionFalla?: string;
  acciones?: string[];
  fechaDesde?: string;
  fechaHasta?: string;
  soloEliminados?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class FallasSoldaduraInoxRepository {
  constructor(
    @InjectRepository(FallaSoldaduraInox)
    private readonly repo: Repository<FallaSoldaduraInox>,
  ) {}

  async listar(filtros: FiltrosResueltosFSI): Promise<[FallaSoldaduraInox[], number]> {
    const {
      cambiaviaIds, tramoIds, via, ubicacionFalla, acciones,
      fechaDesde, fechaHasta,
      soloEliminados = false,
      page = 1, limit = 20,
    } = filtros;

    // JOIN doble: falla → cambiavía → tramo
    const q = this.repo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.cambiavia', 'cv')
      .leftJoinAndSelect('cv.tramo', 'tramo');

    q.andWhere('f.eliminado = :el', { el: soloEliminados });

    if (cambiaviaIds?.length)
      q.andWhere('f.cambiaviaId IN (:...cIds)', { cIds: cambiaviaIds });

    if (tramoIds?.length)
      q.andWhere('cv.tramoId IN (:...tIds)', { tIds: tramoIds });

    if (via)
      q.andWhere('cv.via = :v', { v: via });

    if (ubicacionFalla)
      q.andWhere('f.ubicacionFalla = :uf', { uf: ubicacionFalla });

    if (acciones?.length)
      q.andWhere('f.accion IN (:...accs)', { accs: acciones });

    if (fechaDesde)
      q.andWhere('f.fechaDeteccion >= :fd', { fd: fechaDesde });

    if (fechaHasta)
      q.andWhere('f.fechaDeteccion <= :fh', { fh: fechaHasta });

    q.orderBy('f.fechaDeteccion', 'DESC')
      .addOrderBy('f.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return q.getManyAndCount();
  }

  async buscarPorId(id: number, incluirEliminadas = false): Promise<FallaSoldaduraInox | null> {
    const q = this.repo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.cambiavia', 'cv')
      .leftJoinAndSelect('cv.tramo', 'tramo')
      .where('f.id = :id', { id });

    if (!incluirEliminadas) {
      q.andWhere('f.eliminado = false');
    }

    return q.getOne();
  }

  async crear(datos: Partial<FallaSoldaduraInox>): Promise<FallaSoldaduraInox> {
    return this.repo.save(this.repo.create(datos));
  }

  async actualizar(falla: FallaSoldaduraInox, cambios: Partial<FallaSoldaduraInox>): Promise<FallaSoldaduraInox> {
    Object.assign(falla, cambios);
    return this.repo.save(falla);
  }
  
  /** Cuenta cuántos registros están eliminados. Para badge de auditoría. */
  async contarEliminados(): Promise<number> {
    return this.repo.count({ where: { eliminado: true } });
  }
  
}