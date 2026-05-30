// backend/src/modules/fallas/repositories/fallas-analytics.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FallaRiel } from '../entities/falla-riel.entity';
import { FallaSoldaduraInox } from '../entities/falla-soldadura-inox.entity';
import { AccionFalla } from '../../../common/enums';
import { ColumnasPorNivel } from '../helpers/graficos.helper';

/**
 * ============================================================
 * FALLAS — REPOSITORY ANALÍTICO
 * ============================================================
 * Diseño:
 *  - UNA query por gráfico, parametrizada por nivel.
 *  - El nivel decide qué columna se agrupa en cada tabla.
 *  - Riel y soldadura se unifican vía UNION ALL antes de agrupar.
 *  - Sin duplicación: cada fila representa una falla en su nivel.
 *
 * Reglas de filtros AVANZADOS (familia B):
 *  - Vacío en un avanzado = NO acota (todas las fallas pasan).
 *  - SIN_DEFINIR es un valor más, no se trata especial.
 *  - Una tabla que NO tiene la columna referida en un avanzado
 *    simplemente NO se incluye en el UNION ALL (lo decide el service).
 * ============================================================
 */
@Injectable()
export class FallasAnalyticsRepository {
  constructor(
    @InjectRepository(FallaRiel)
    private readonly fallasRielRepo: Repository<FallaRiel>,
    @InjectRepository(FallaSoldaduraInox)
    private readonly fallasSoldRepo: Repository<FallaSoldaduraInox>,
  ) {}

  // ==========================================================
  // KPIs (sin cambios respecto al anterior; los gráficos no los tocan)
  // ==========================================================

  async contarTotalEnRango(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{ riel: number; soldadura: number }> {
    const riel = await this.fallasRielRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.fecha BETWEEN :desde AND :hasta', { desde: fechaDesde, hasta: fechaHasta })
      .getCount();

    const soldadura = await this.fallasSoldRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.fecha_deteccion BETWEEN :desde AND :hasta', { desde: fechaDesde, hasta: fechaHasta })
      .getCount();

    return { riel, soldadura };
  }

  async obtenerTramoConMasFallas(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{ tramoId: number; codigo: string; nombre: string; total: number } | null> {
    const sql = `
      WITH fallas_unificadas AS (
        SELECT f.tramo_id FROM fallas_riel f
        WHERE f.eliminado = false AND f.fecha BETWEEN $1 AND $2
        UNION ALL
        SELECT cv.tramo_id FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false AND f.fecha_deteccion BETWEEN $1 AND $2
      )
      SELECT fu.tramo_id AS "tramoId", t.codigo, t.nombre, COUNT(*)::int AS total
      FROM fallas_unificadas fu
      JOIN tramos t ON t.id = fu.tramo_id
      GROUP BY fu.tramo_id, t.codigo, t.nombre
      ORDER BY total DESC LIMIT 1
    `;
    const result = await this.fallasRielRepo.query(sql, [fechaDesde, fechaHasta]);
    if (result.length === 0) return null;
    return result[0];
  }

  async contarSoldadurasSinAccion(): Promise<number> {
    return this.fallasSoldRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.accion = :accion', { accion: AccionFalla.POR_DEFINIR })
      .getCount();
  }

  // ==========================================================
  // G1 — Evolución temporal por elemento del nivel
  // ==========================================================

  async fallasG1(input: {
    granularidad: 'MENSUAL' | 'ANUAL';
    fechaDesde: Date;
    fechaHasta: Date;
    incluirRiel: boolean;
    incluirSoldadura: boolean;
    viaFiltro: string | null;
    elementoIds: number[];
    cols: ColumnasPorNivel;
  }): Promise<Array<{ elementoId: number; nombre: string; codigo: string; periodo: number; total: number }>> {
    const {
      granularidad, fechaDesde, fechaHasta,
      incluirRiel, incluirSoldadura, viaFiltro, elementoIds, cols,
    } = input;

    const extractExpr = granularidad === 'MENSUAL' ? 'MONTH' : 'YEAR';

    // params 1..3 reservados; resto dinámicos
    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];

    // IDs in
    const inicioIds = params.length + 1;
    const phIds = elementoIds.map((_, i) => `$${inicioIds + i}`).join(',');
    params.push(...elementoIds);

    const partes: string[] = [];

    // RIEL: solo si esta tabla aplica al nivel (columnaRiel no es null)
    if (incluirRiel && cols.columnaRiel) {
      partes.push(`
        SELECT ${cols.columnaRiel} AS elemento_id, f.fecha AS fecha
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
          AND ($3::text IS NULL OR f.via = $3)
          AND ${cols.columnaRiel} IN (${phIds})
      `);
    }

    // SOLDADURA: siempre por cv (cambiavía) salvo nivel=CAMBIAVIA que usa f.cambiavia_id
    if (incluirSoldadura) {
      partes.push(`
        SELECT ${cols.columnaSoldadura} AS elemento_id, f.fecha_deteccion AS fecha
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cv.via = $3)
          AND ${cols.columnaSoldadura} IN (${phIds})
      `);
    }

    if (partes.length === 0) return [];

    const sql = `
      WITH fallas_unificadas AS (
        ${partes.join(' UNION ALL ')}
      )
      SELECT
        fu.elemento_id AS "elementoId",
        c.${cols.columnaNombreCatalogo} AS "nombre",
        c.${cols.columnaCodigoCatalogo} AS "codigo",
        EXTRACT(${extractExpr} FROM fu.fecha)::int AS "periodo",
        COUNT(*)::int AS "total"
      FROM fallas_unificadas fu
      JOIN ${cols.tablaCatalogo} c ON c.id = fu.elemento_id
      WHERE fu.elemento_id IS NOT NULL
      GROUP BY fu.elemento_id, c.${cols.columnaNombreCatalogo}, c.${cols.columnaCodigoCatalogo}, EXTRACT(${extractExpr} FROM fu.fecha)
      ORDER BY "nombre" ASC, "periodo" ASC
    `;

    return this.fallasRielRepo.query(sql, params);
  }

  // ==========================================================
  // G2 — Distribución por categoría (modo CATEGORIA)
  // ==========================================================

  async fallasG2PorCategoria(input: {
    columnaCategoriaRiel: string | null;
    columnaCategoriaSoldadura: string | null;
    fechaDesde: Date;
    fechaHasta: Date;
    incluirRiel: boolean;
    incluirSoldadura: boolean;
    viaFiltro: string | null;
    elementoIds: number[];
    cols: ColumnasPorNivel;
    avanzadosRiel: string;     // string SQL ya armado, vacío si no hay
    avanzadosSoldadura: string;
    paramsExtra: any[];
  }): Promise<Array<{ categoria: string; total: number }>> {
    const {
      columnaCategoriaRiel, columnaCategoriaSoldadura,
      fechaDesde, fechaHasta,
      incluirRiel, incluirSoldadura, viaFiltro,
      elementoIds, cols,
      avanzadosRiel, avanzadosSoldadura, paramsExtra,
    } = input;

    const params: any[] = [fechaDesde, fechaHasta, viaFiltro, ...paramsExtra];

    const inicioIds = params.length + 1;
    const phIds = elementoIds.map((_, i) => `$${inicioIds + i}`).join(',');
    params.push(...elementoIds);

    const partes: string[] = [];

    if (incluirRiel && cols.columnaRiel && columnaCategoriaRiel) {
      partes.push(`
        SELECT f.${columnaCategoriaRiel}::text AS categoria
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
          AND ($3::text IS NULL OR f.via = $3)
          AND ${cols.columnaRiel} IN (${phIds})
          ${avanzadosRiel}
      `);
    }

    if (incluirSoldadura && columnaCategoriaSoldadura) {
      const expr = columnaCategoriaSoldadura.startsWith('cv.')
        ? columnaCategoriaSoldadura
        : `f.${columnaCategoriaSoldadura}`;
      partes.push(`
        SELECT ${expr}::text AS categoria
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cv.via = $3)
          AND ${cols.columnaSoldadura} IN (${phIds})
          ${avanzadosSoldadura}
      `);
    }

    if (partes.length === 0) return [];

    const sql = `
      WITH fallas_unificadas AS (
        ${partes.join(' UNION ALL ')}
      )
      SELECT categoria AS "categoria", COUNT(*)::int AS "total"
      FROM fallas_unificadas
      WHERE categoria IS NOT NULL
      GROUP BY categoria
      ORDER BY "total" DESC, categoria ASC
    `;

    return this.fallasRielRepo.query(sql, params);
  }

  // ==========================================================
  // G2 — Distribución por categoría (modo ELEMENTO)
  // ==========================================================
  // Devuelve filas (elementoId, categoria, total) para que el service
  // construya el reparto apilado por elemento.

  async fallasG2PorElemento(input: {
    columnaCategoriaRiel: string | null;
    columnaCategoriaSoldadura: string | null;
    fechaDesde: Date;
    fechaHasta: Date;
    incluirRiel: boolean;
    incluirSoldadura: boolean;
    viaFiltro: string | null;
    elementoIds: number[];
    cols: ColumnasPorNivel;
    avanzadosRiel: string;
    avanzadosSoldadura: string;
    paramsExtra: any[];
  }): Promise<Array<{ elementoId: number; nombre: string; codigo: string; categoria: string; total: number }>> {
    const {
      columnaCategoriaRiel, columnaCategoriaSoldadura,
      fechaDesde, fechaHasta,
      incluirRiel, incluirSoldadura, viaFiltro,
      elementoIds, cols,
      avanzadosRiel, avanzadosSoldadura, paramsExtra,
    } = input;

    const params: any[] = [fechaDesde, fechaHasta, viaFiltro, ...paramsExtra];

    const inicioIds = params.length + 1;
    const phIds = elementoIds.map((_, i) => `$${inicioIds + i}`).join(',');
    params.push(...elementoIds);

    const partes: string[] = [];

    if (incluirRiel && cols.columnaRiel && columnaCategoriaRiel) {
      partes.push(`
        SELECT ${cols.columnaRiel} AS elemento_id, f.${columnaCategoriaRiel}::text AS categoria
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
          AND ($3::text IS NULL OR f.via = $3)
          AND ${cols.columnaRiel} IN (${phIds})
          ${avanzadosRiel}
      `);
    }

    if (incluirSoldadura && columnaCategoriaSoldadura) {
      const expr = columnaCategoriaSoldadura.startsWith('cv.')
        ? columnaCategoriaSoldadura
        : `f.${columnaCategoriaSoldadura}`;
      partes.push(`
        SELECT ${cols.columnaSoldadura} AS elemento_id, ${expr}::text AS categoria
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cv.via = $3)
          AND ${cols.columnaSoldadura} IN (${phIds})
          ${avanzadosSoldadura}
      `);
    }

    if (partes.length === 0) return [];

    const sql = `
      WITH fallas_unificadas AS (
        ${partes.join(' UNION ALL ')}
      )
      SELECT
        fu.elemento_id AS "elementoId",
        c.${cols.columnaNombreCatalogo} AS "nombre",
        c.${cols.columnaCodigoCatalogo} AS "codigo",
        fu.categoria AS "categoria",
        COUNT(*)::int AS "total"
      FROM fallas_unificadas fu
      JOIN ${cols.tablaCatalogo} c ON c.id = fu.elemento_id
      WHERE fu.elemento_id IS NOT NULL AND fu.categoria IS NOT NULL
      GROUP BY fu.elemento_id, c.${cols.columnaNombreCatalogo}, c.${cols.columnaCodigoCatalogo}, fu.categoria
      ORDER BY "nombre" ASC, "categoria" ASC
    `;

    return this.fallasRielRepo.query(sql, params);
  }

  // ==========================================================
  // G3 — Fallas por velocidad
  // ==========================================================

  async fallasG3PorVelocidad(input: {
    fechaDesde: Date;
    fechaHasta: Date;
    incluirRiel: boolean;
    incluirSoldadura: boolean;
    viaFiltro: string | null;
    elementoIds: number[];
    cols: ColumnasPorNivel;
  }): Promise<Array<{ velocidad: number; tipo: 'RIEL' | 'SOLDADURA'; total: number }>> {
    const {
      fechaDesde, fechaHasta,
      incluirRiel, incluirSoldadura, viaFiltro,
      elementoIds, cols,
    } = input;

    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];
    const inicioIds = params.length + 1;
    const phIds = elementoIds.map((_, i) => `$${inicioIds + i}`).join(',');
    params.push(...elementoIds);

    const partes: string[] = [];

    if (incluirRiel && cols.columnaRiel) {
      partes.push(`
        SELECT f.velocidad_kmh AS velocidad, 'RIEL'::text AS tipo
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
          AND f.velocidad_kmh IS NOT NULL
          AND ($3::text IS NULL OR f.via = $3)
          AND ${cols.columnaRiel} IN (${phIds})
      `);
    }

    if (incluirSoldadura) {
      partes.push(`
        SELECT cv.velocidad_kmh AS velocidad, 'SOLDADURA'::text AS tipo
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
          AND cv.velocidad_kmh IS NOT NULL
          AND ($3::text IS NULL OR cv.via = $3)
          AND ${cols.columnaSoldadura} IN (${phIds})
      `);
    }

    if (partes.length === 0) return [];

    const sql = `
      WITH fallas_unificadas AS (
        ${partes.join(' UNION ALL ')}
      )
      SELECT velocidad AS "velocidad", tipo AS "tipo", COUNT(*)::int AS "total"
      FROM fallas_unificadas
      GROUP BY velocidad, tipo
      ORDER BY velocidad ASC, tipo ASC
    `;

    return this.fallasRielRepo.query(sql, params);
  }

  // ==========================================================
  // Helpers de avanzados (G2)
  // ==========================================================
  // Construyen el WHERE para los avanzados y agregan placeholders
  // a `params`. Vacío = no acota.

  /**
   * Devuelve `AND col IN ($n,$n+1...)` añadiendo placeholders a params.
   * Si el array está vacío o undefined, devuelve '' (no acota).
   */
  construirInEnum(
    valores: string[] | undefined,
    params: any[],
    columna: string,
  ): string {
    if (!valores?.length) return '';
    const inicio = params.length + 1;
    const placeholders = valores.map((_, i) => `$${inicio + i}`).join(',');
    params.push(...valores);
    return `AND ${columna} IN (${placeholders})`;
  }
}