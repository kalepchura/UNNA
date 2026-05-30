import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FallaRiel } from '../entities/falla-riel.entity';
import {
  EstadoFalla,
  AccionRiel,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
} from '../../../common/enums';

/**
 * Filtros ya resueltos a IDs (lo construye el service después
 * de traducir códigos a IDs).
 */
export interface FiltrosResueltos {
  // Geográficos
  tramoIds?: number[];
  curvaHorizontalIds?: number[];
  curvaVerticalIds?: number[];

  // Atributos simples
  via?: string;
  carril?: string;

  // Temporales
  fechaDesde?: string;
  fechaHasta?: string;

  // Soft delete
  soloEliminados?: boolean;

  // ----- FASE 3: filtros por enum (multi-select) -----
  estadosActuales?: EstadoFalla[];
  accionesActuales?: AccionRiel[];
  tipoDefectos?: TipoDefectoRiel[];
  elementosAfectados?: ElementoAfectadoRiel[];
  zonasAfectadas?: ZonaAfectadaRiel[];
  perfiles?: PerfilFallaRiel[];
  altasBajas?: AltaBaja[];

  // Paginación
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
      // Enum filters (Fase 3)
      estadosActuales, accionesActuales, tipoDefectos,
      elementosAfectados, zonasAfectadas, perfiles, altasBajas,
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

    // ----- Geográficos -----
    if (tramoIds?.length) q.andWhere('f.tramo_id IN (:...tIds)', { tIds: tramoIds });
    if (curvaHorizontalIds?.length) q.andWhere('f.curva_horizontal_id IN (:...chIds)', { chIds: curvaHorizontalIds });
    if (curvaVerticalIds?.length) q.andWhere('f.curva_vertical_id IN (:...cvIds)', { cvIds: curvaVerticalIds });

    // ----- Atributos simples -----
    if (via) q.andWhere('f.via = :v', { v: via });
    if (carril) q.andWhere('f.carril = :c', { c: carril });

    // ----- Temporales -----
    if (fechaDesde) q.andWhere('f.fecha >= :fd', { fd: fechaDesde });
    if (fechaHasta) q.andWhere('f.fecha <= :fh', { fh: fechaHasta });

    // ============================================================
    // FILTROS POR ENUM (FASE 3 — Listado completo)
    // ============================================================
    // Patrón uniforme: si llega array no vacío → AND col IN (...valores).
    // Vacío o undefined → no se agrega cláusula.

    if (estadosActuales?.length) {
      q.andWhere('f.estado_actual IN (:...estados)', { estados: estadosActuales });
    }

    if (accionesActuales?.length) {
      // `accion_actual` puede ser NULL (falla sin acción aún registrada).
      // Si el usuario filtra por una acción específica, NULL queda fuera.
      // Este es el comportamiento esperado: "muéstrame las que tienen
      // ESMERILADO" → no devuelve las que aún no tienen acción.
      q.andWhere('f.accion_actual IN (:...acciones)', { acciones: accionesActuales });
    }

    if (tipoDefectos?.length) {
      q.andWhere('f.tipo_defecto IN (:...tds)', { tds: tipoDefectos });
    }

    if (elementosAfectados?.length) {
      q.andWhere('f.elemento_afectado IN (:...elems)', { elems: elementosAfectados });
    }

    if (zonasAfectadas?.length) {
      q.andWhere('f.zona_afectada IN (:...zonas)', { zonas: zonasAfectadas });
    }

    if (perfiles?.length) {
      q.andWhere('f.perfil IN (:...perfs)', { perfs: perfiles });
    }

    if (altasBajas?.length) {
      q.andWhere('f.alta_baja IN (:...ab)', { ab: altasBajas });
    }

    // ----- Ordenamiento + paginación -----
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