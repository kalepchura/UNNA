import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FallaRiel } from '../entities/falla-riel.entity';
import { FiltrarFallasRielDto } from '../dto/falla-riel/filtrar-fallas-riel.dto';

/**
 * Filtros ya resueltos a IDs (lo construye el service después
 * de traducir códigos a IDs).
 */
export interface FiltrosResueltos {
  tramoIds?: number[];
  curvaHorizontalIds?: number[];
  curvaVerticalIds?: number[];
  via?: string;
  carril?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  soloEliminados?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class FallasRielRepository {
  constructor(
    @InjectRepository(FallaRiel)
    private readonly repo: Repository<FallaRiel>,
  ) {}

  /** Lista con JOIN a catálogos para devolver nombres en el response. */
  async listar(filtros: FiltrosResueltos): Promise<[FallaRiel[], number]> {
    const {
      tramoIds, curvaHorizontalIds, curvaVerticalIds,
      via, carril, fechaDesde, fechaHasta,
      soloEliminados = false,
      page = 1, limit = 20,
    } = filtros;

    const q = this.repo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.tramo', 'tramo')
      .leftJoinAndSelect('f.curvaHorizontal', 'curvaH')
      .leftJoinAndSelect('f.curvaVertical', 'curvaV');

    // Soft delete: por default solo activos. Si soloEliminados=true → solo eliminados.
    q.andWhere('f.eliminado = :el', { el: soloEliminados });

    if (tramoIds?.length) q.andWhere('f.tramo_id IN (:...tIds)', { tIds: tramoIds });
    if (curvaHorizontalIds?.length) q.andWhere('f.curva_horizontal_id IN (:...chIds)', { chIds: curvaHorizontalIds });
    if (curvaVerticalIds?.length) q.andWhere('f.curva_vertical_id IN (:...cvIds)', { cvIds: curvaVerticalIds });
    if (via) q.andWhere('f.via = :v', { v: via });
    if (carril) q.andWhere('f.carril = :c', { c: carril });
    if (fechaDesde) q.andWhere('f.fecha >= :fd', { fd: fechaDesde });
    if (fechaHasta) q.andWhere('f.fecha <= :fh', { fh: fechaHasta });

    q.orderBy('f.fecha', 'DESC')
      .addOrderBy('f.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return q.getManyAndCount();
  }

  /** Busca una falla por ID, incluyendo eliminadas (para admin). */
  async buscarPorId(id: number, incluirEliminadas = false): Promise<FallaRiel | null> {
    const q = this.repo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.tramo', 'tramo')
      .leftJoinAndSelect('f.curvaHorizontal', 'curvaH')
      .leftJoinAndSelect('f.curvaVertical', 'curvaV')
      .where('f.id = :id', { id });

    if (!incluirEliminadas) {
      q.andWhere('f.eliminado = false');
    }

    return q.getOne();
  }

  async crear(datos: Partial<FallaRiel>): Promise<FallaRiel> {
    const nueva = this.repo.create(datos);
    return this.repo.save(nueva);
  }

  async actualizar(falla: FallaRiel, cambios: Partial<FallaRiel>): Promise<FallaRiel> {
    Object.assign(falla, cambios);
    return this.repo.save(falla);
  }

  /** Cuenta cuántos registros están eliminados. Para badge de auditoría. */
  async contarEliminados(): Promise<number> {
    return this.repo.count({ where: { eliminado: true } });
  }
}