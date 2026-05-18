import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FallaRiel } from '../entities/falla-riel.entity';
import { FallaSoldaduraInox } from '../entities/falla-soldadura-inox.entity';
import { AccionFalla } from '../../../common/enums';

/**
 * ============================================================
 * FallasAnalyticsRepository
 * ============================================================
 * Repositorio especializado en queries agregadas para KPIs
 * y gráficos de Fallas.
 *
 * Separamos del repository CRUD porque:
 *  - Las queries son distintas (COUNT, GROUP BY, etc.)
 *  - Mantiene cada repository con responsabilidad única
 *  - Permite optimizaciones específicas (ej: índices distintos)
 *
 * Todas las queries excluyen registros eliminados (soft delete).
 *
 * SEGURIDAD:
 * Todas las queries usan parámetros posicionales ($1, $2, ...)
 * para prevenir SQL Injection. Los nombres de columnas en
 * fallasPorCategoria provienen de una whitelist estática
 * (MAPEO_CATEGORIA en Grafico2FallasService), nunca de input
 * directo del usuario.
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

  // ----------------------------------------------------------
  // KPI 1: Total fallas en mes actual (Riel + Soldadura)
  // ----------------------------------------------------------

  /**
   * Cuenta fallas creadas dentro del rango de fechas dado.
   *
   * @param fechaDesde Inicio del rango (inclusivo)
   * @param fechaHasta Fin del rango (inclusivo)
   */
  async contarTotalEnRango(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{ riel: number; soldadura: number }> {
    // Conteo de fallas de riel en el rango
    const riel = await this.fallasRielRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.fecha BETWEEN :desde AND :hasta', {
        desde: fechaDesde,
        hasta: fechaHasta,
      })
      .getCount();

    // Conteo de fallas de soldadura en el rango
    const soldadura = await this.fallasSoldRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.fecha_deteccion BETWEEN :desde AND :hasta', {
        desde: fechaDesde,
        hasta: fechaHasta,
      })
      .getCount();

    return { riel, soldadura };
  }

  // ----------------------------------------------------------
  // KPI 2: Tramo con más fallas en últimos 12 meses
  // ----------------------------------------------------------

  /**
   * Devuelve el tramo con mayor cantidad de fallas en el rango.
   *
   * Considera AMBAS tablas (Riel y Soldadura). Para Soldadura,
   * el tramo viene vía cambiavía → tramo_id.
   *
   * Devuelve null si no hay fallas en el rango.
   */
  async obtenerTramoConMasFallas(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{ tramoId: number; codigo: string; nombre: string; total: number } | null> {
    // ✨ Query con alias calificados (f.tramo_id, cv.tramo_id) para evitar ambigüedad
    const sql = `
      WITH fallas_unificadas AS (
        SELECT f.tramo_id
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
        UNION ALL
        SELECT cv.tramo_id
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
      )
      SELECT
        fu.tramo_id AS "tramoId",
        t.codigo,
        t.nombre,
        COUNT(*)::int AS total
      FROM fallas_unificadas fu
      JOIN tramos t ON t.id = fu.tramo_id
      GROUP BY fu.tramo_id, t.codigo, t.nombre
      ORDER BY total DESC
      LIMIT 1
    `;

    const result = await this.fallasRielRepo.query(sql, [fechaDesde, fechaHasta]);

    if (result.length === 0) return null;
    return result[0];
  }

  // ----------------------------------------------------------
  // KPI 3: Soldaduras sin acción definida (POR_DEFINIR)
  // ----------------------------------------------------------

  /**
   * Cuenta fallas de soldadura activas con acción = POR_DEFINIR.
   * Considera el histórico completo (no por rango).
   */
  async contarSoldadurasSinAccion(): Promise<number> {
    return this.fallasSoldRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.accion = :accion', { accion: AccionFalla.POR_DEFINIR })
      .getCount();
  }

  // ----------------------------------------------------------
  // GRÁFICO 1: Evolución temporal por tramo
  // ----------------------------------------------------------

  /**
   * Cuenta fallas agrupadas por tramo y por periodo (mes o año).
   *
   * @param granularidad 'MENSUAL' o 'ANUAL' (controla el EXTRACT)
   * @param fechaDesde   Inicio del rango
   * @param fechaHasta   Fin del rango (inclusivo)
   * @param incluirRiel  Si true, suma fallas_riel
   * @param incluirSoldadura Si true, suma fallas_soldadura_inox
   * @param viaFiltro    'PAR' | 'IMPAR' | null (null = ambas)
   * @param tramoIds     IDs de tramos seleccionados (opcional, null/[] = todos)
   *
   * 🔒 SEGURIDAD: tramoIds y viaFiltro son parámetros posicionales,
   * no se concatenan al SQL.
   */
  async fallasPorTramoYPeriodo(
    granularidad: 'MENSUAL' | 'ANUAL',
    fechaDesde: Date,
    fechaHasta: Date,
    incluirRiel: boolean,
    incluirSoldadura: boolean,
    viaFiltro: string | null,
    tramoIds?: number[],
  ): Promise<Array<{
    tramoId: number;
    codigo: string;
    nombre: string;
    periodo: number;
    total: number;
  }>> {
    // EXTRACT solo acepta literales fijos, no es input de usuario -> seguro
    const extractExpr = granularidad === 'MENSUAL' ? 'MONTH' : 'YEAR';

    // 🔒 Acumulamos parámetros en orden: $1=desde, $2=hasta, $3=viaFiltro, luego tramoIds
    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];

    // 🔒 Construir placeholders dinámicos para tramoIds: $4, $5, $6...
    let tramoCondicionRiel = '';
    let tramoCondicionSold = '';
    if (tramoIds?.length) {
      const inicio = params.length + 1; // siguiente índice disponible
      const placeholders = tramoIds.map((_, i) => `$${inicio + i}`).join(',');
      tramoCondicionRiel = `AND f.tramo_id IN (${placeholders})`;
      tramoCondicionSold = `AND cv.tramo_id IN (${placeholders})`;
      params.push(...tramoIds);
    }

    // 🔒 viaFiltro parametrizado: si es null, el filtro no aplica (NULL IS NULL pasa)
    const viaCondicionRiel = `AND ($3::text IS NULL OR f.via = $3)`;
    const viaCondicionSold = `AND ($3::text IS NULL OR cv.via = $3)`;

    const partes: string[] = [];

    if (incluirRiel) {
      partes.push(`
        SELECT
          f.tramo_id,
          f.fecha AS fecha
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
          ${viaCondicionRiel}
          ${tramoCondicionRiel}
      `);
    }

    if (incluirSoldadura) {
      partes.push(`
        SELECT
          cv.tramo_id,
          f.fecha_deteccion AS fecha
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
          ${viaCondicionSold}
          ${tramoCondicionSold}
      `);
    }

    if (partes.length === 0) return [];

    const unionSql = partes.join(' UNION ALL ');

    const sql = `
      WITH fallas_unificadas AS (
        ${unionSql}
      )
      SELECT
        fu.tramo_id   AS "tramoId",
        t.codigo      AS "codigo",
        t.nombre      AS "nombre",
        EXTRACT(${extractExpr} FROM fu.fecha)::int AS "periodo",
        COUNT(*)::int AS "total"
      FROM fallas_unificadas fu
      JOIN tramos t ON t.id = fu.tramo_id
      GROUP BY fu.tramo_id, t.codigo, t.nombre, EXTRACT(${extractExpr} FROM fu.fecha)
      ORDER BY t.codigo ASC, "periodo" ASC
    `;

    return this.fallasRielRepo.query(sql, params);
  }

  // ----------------------------------------------------------
  // GRÁFICO 2: Distribución por categoría
  // ----------------------------------------------------------

  /**
   * Cuenta fallas agrupadas por una categoría dinámica.
   *
   * @param columnaRiel       Nombre de columna en fallas_riel (o null si no aplica)
   * @param columnaSoldadura  Nombre de columna en fallas_soldadura_inox (o null si no aplica)
   * @param fechaDesde / fechaHasta  Rango temporal
   * @param incluirRiel       Considerar fallas_riel
   * @param incluirSoldadura  Considerar fallas_soldadura_inox
   * @param viaFiltro         'PAR' | 'IMPAR' | null
   * @param tramoIds          IDs de tramos (opcional)
   *
   * 🔒 SEGURIDAD:
   * - columnaRiel y columnaSoldadura vienen de whitelist estática
   *   (MAPEO_CATEGORIA en Grafico2FallasService), NUNCA de input del usuario.
   * - tramoIds y viaFiltro son parámetros posicionales.
   */
  async fallasPorCategoria(
    columnaRiel: string | null,
    columnaSoldadura: string | null,
    fechaDesde: Date,
    fechaHasta: Date,
    incluirRiel: boolean,
    incluirSoldadura: boolean,
    viaFiltro: string | null,
    tramoIds?: number[],
  ): Promise<Array<{ categoria: string; total: number }>> {
    // 🔒 Parámetros posicionales
    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];

    let tramoCondicionRiel = '';
    let tramoCondicionSold = '';
    if (tramoIds?.length) {
      const inicio = params.length + 1;
      const placeholders = tramoIds.map((_, i) => `$${inicio + i}`).join(',');
      tramoCondicionRiel = `AND f.tramo_id IN (${placeholders})`;
      tramoCondicionSold = `AND cv.tramo_id IN (${placeholders})`;
      params.push(...tramoIds);
    }

    const viaCondicionRiel = `AND ($3::text IS NULL OR f.via = $3)`;
    const viaCondicionSold = `AND ($3::text IS NULL OR cv.via = $3)`;

    const partes: string[] = [];

    if (incluirRiel && columnaRiel) {
      partes.push(`
        SELECT f.${columnaRiel}::text AS categoria
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
          ${viaCondicionRiel}
          ${tramoCondicionRiel}
      `);
    }

    if (incluirSoldadura && columnaSoldadura) {
      // Si la columna empieza con "cv.", ya viene calificada (ej: cv.via)
      const expresionCol = columnaSoldadura.startsWith('cv.')
        ? columnaSoldadura
        : `f.${columnaSoldadura}`;
      partes.push(`
        SELECT ${expresionCol}::text AS categoria
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
          ${viaCondicionSold}
          ${tramoCondicionSold}
      `);
    }

    if (partes.length === 0) return [];

    const unionSql = partes.join(' UNION ALL ');

    const sql = `
      WITH fallas_unificadas AS (
        ${unionSql}
      )
      SELECT
        categoria      AS "categoria",
        COUNT(*)::int  AS "total"
      FROM fallas_unificadas
      WHERE categoria IS NOT NULL
      GROUP BY categoria
      ORDER BY "total" DESC, categoria ASC
    `;

    return this.fallasRielRepo.query(sql, params);
  }

  // ----------------------------------------------------------
  // GRÁFICO 3: Fallas por velocidad
  // ----------------------------------------------------------

  /**
   * Cuenta fallas agrupadas por velocidad y por tipo (RIEL/SOLDADURA).
   *
   * @param fechaDesde Inicio del rango
   * @param fechaHasta Fin del rango
   * @param incluirRiel Si incluir fallas de riel
   * @param incluirSoldadura Si incluir fallas de soldadura
   * @param viaFiltro 'PAR' | 'IMPAR' | null
   * @param tramoIds IDs de tramos seleccionados (opcional)
   *
   * 🔒 SEGURIDAD: tramoIds y viaFiltro son parámetros posicionales.
   */
  async fallasPorVelocidadYTipo(
    fechaDesde: Date,
    fechaHasta: Date,
    incluirRiel: boolean,
    incluirSoldadura: boolean,
    viaFiltro: string | null,
    tramoIds?: number[],
  ): Promise<Array<{ velocidad: number; tipo: 'RIEL' | 'SOLDADURA'; total: number }>> {
    // 🔒 Parámetros posicionales
    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];

    let tramoCondicionRiel = '';
    let tramoCondicionSold = '';
    if (tramoIds?.length) {
      const inicio = params.length + 1;
      const placeholders = tramoIds.map((_, i) => `$${inicio + i}`).join(',');
      tramoCondicionRiel = `AND f.tramo_id IN (${placeholders})`;
      tramoCondicionSold = `AND cv.tramo_id IN (${placeholders})`;
      params.push(...tramoIds);
    }

    const viaCondicionRiel = `AND ($3::text IS NULL OR f.via = $3)`;
    const viaCondicionSold = `AND ($3::text IS NULL OR cv.via = $3)`;

    const partes: string[] = [];

    if (incluirRiel) {
      partes.push(`
        SELECT
          f.velocidad_kmh AS velocidad,
          'RIEL'::text    AS tipo
        FROM fallas_riel f
        WHERE f.eliminado = false
          AND f.fecha BETWEEN $1 AND $2
          AND f.velocidad_kmh IS NOT NULL
          ${viaCondicionRiel}
          ${tramoCondicionRiel}
      `);
    }

    if (incluirSoldadura) {
      partes.push(`
        SELECT
          cv.velocidad_kmh    AS velocidad,
          'SOLDADURA'::text   AS tipo
        FROM fallas_soldadura_inox f
        JOIN cambiavias cv ON cv.id = f.cambiavia_id
        WHERE f.eliminado = false
          AND f.fecha_deteccion BETWEEN $1 AND $2
          AND cv.velocidad_kmh IS NOT NULL
          ${viaCondicionSold}
          ${tramoCondicionSold}
      `);
    }

    if (partes.length === 0) return [];

    const unionSql = partes.join(' UNION ALL ');

    const sql = `
      WITH fallas_unificadas AS (
        ${unionSql}
      )
      SELECT
        velocidad     AS "velocidad",
        tipo          AS "tipo",
        COUNT(*)::int AS "total"
      FROM fallas_unificadas
      GROUP BY velocidad, tipo
      ORDER BY velocidad ASC, tipo ASC
    `;

    return this.fallasRielRepo.query(sql, params);
  }
}