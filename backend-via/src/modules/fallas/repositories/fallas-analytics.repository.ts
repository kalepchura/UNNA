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
 *
 * ============================================================
 * NOTA SOBRE FILTROS DE CURVA Y ENUMS (FASE 1 + 2.D)
 * ============================================================
 * Los filtros nuevos (curva H/V, tipoDefecto, elementoAfectado, etc.)
 * aplican SOLO a fallas_riel. La parte SOLDADURA del UNION pasa
 * sin esos filtros. Decisión intencional: cuando el usuario filtra
 * por "Astillamiento RCF" y tipoFalla=AMBAS, las soldaduras igual
 * aparecen en el conteo. Esto es transparente y el usuario aprende
 * del comportamiento (los enums de riel no existen en soldadura).
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

  async contarTotalEnRango(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{ riel: number; soldadura: number }> {
    const riel = await this.fallasRielRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.fecha BETWEEN :desde AND :hasta', {
        desde: fechaDesde,
        hasta: fechaHasta,
      })
      .getCount();

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

  async obtenerTramoConMasFallas(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{ tramoId: number; codigo: string; nombre: string; total: number } | null> {
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

  async contarSoldadurasSinAccion(): Promise<number> {
    return this.fallasSoldRepo
      .createQueryBuilder('f')
      .where('f.eliminado = false')
      .andWhere('f.accion = :accion', { accion: AccionFalla.POR_DEFINIR })
      .getCount();
  }

  // ----------------------------------------------------------
  // INTERFACE: filtros analíticos de RIEL
  // ----------------------------------------------------------

  // Reúne en un objeto los filtros opcionales de RIEL para no
  // tener firmas de método con 12 parámetros. Solo gráficos los usan.

  // ----------------------------------------------------------
  // GRÁFICO 1: Evolución temporal por tramo
  // ----------------------------------------------------------

  /**
   * Cuenta fallas agrupadas por tramo y por periodo (mes o año).
   *
   * @param granularidad 'MENSUAL' o 'ANUAL'
   * @param fechaDesde / fechaHasta  Rango temporal
   * @param incluirRiel / incluirSoldadura  Qué tablas considerar
   * @param viaFiltro 'PAR' | 'IMPAR' | null (null = ambas)
   * @param tramoIds IDs de tramos (opcional, aplica a ambas)
   * @param filtrosRiel Filtros que SOLO aplican a fallas_riel
   *
   * 🔒 SEGURIDAD: todos los valores van como parámetros posicionales.
   */
  async fallasPorTramoYPeriodo(
    granularidad: 'MENSUAL' | 'ANUAL',
    fechaDesde: Date,
    fechaHasta: Date,
    incluirRiel: boolean,
    incluirSoldadura: boolean,
    viaFiltro: string | null,
    tramoIds?: number[],
    filtrosRiel?: FiltrosAnaliticosRiel,
  ): Promise<Array<{
    tramoId: number;
    codigo: string;
    nombre: string;
    periodo: number;
    total: number;
  }>> {
    const extractExpr = granularidad === 'MENSUAL' ? 'MONTH' : 'YEAR';

    // 🔒 Parámetros posicionales: $1=desde, $2=hasta, $3=viaFiltro
    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];

    // Tramos (aplica a ambas)
    const { condicionRiel: tramoCondicionRiel, condicionSold: tramoCondicionSold } =
      this.construirCondicionIds(tramoIds, params, 'f.tramo_id', 'cv.tramo_id');

    // Curvas y enums (solo riel)
    const condicionesRielExtra = this.construirCondicionesRiel(filtrosRiel, params);

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
          ${condicionesRielExtra}
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

    const sql = `
      WITH fallas_unificadas AS (
        ${partes.join(' UNION ALL ')}
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
   * @param columnaRiel       Whitelist estática (MAPEO_CATEGORIA en service)
   * @param columnaSoldadura  Whitelist estática
   * @param fechaDesde / fechaHasta
   * @param incluirRiel / incluirSoldadura
   * @param viaFiltro
   * @param tramoIds
   * @param filtrosRiel Filtros solo de fallas_riel (curva + enums Fase 2.D)
   *
   * 🔒 columnaRiel/columnaSoldadura vienen SIEMPRE de whitelist estática,
   * NUNCA de input del usuario.
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
    filtrosRiel?: FiltrosAnaliticosRiel,
  ): Promise<Array<{ categoria: string; total: number }>> {
    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];

    const { condicionRiel: tramoCondicionRiel, condicionSold: tramoCondicionSold } =
      this.construirCondicionIds(tramoIds, params, 'f.tramo_id', 'cv.tramo_id');

    const condicionesRielExtra = this.construirCondicionesRiel(filtrosRiel, params);

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
          ${condicionesRielExtra}
      `);
    }

    if (incluirSoldadura && columnaSoldadura) {
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

    const sql = `
      WITH fallas_unificadas AS (
        ${partes.join(' UNION ALL ')}
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

  async fallasPorVelocidadYTipo(
    fechaDesde: Date,
    fechaHasta: Date,
    incluirRiel: boolean,
    incluirSoldadura: boolean,
    viaFiltro: string | null,
    tramoIds?: number[],
    filtrosRiel?: FiltrosAnaliticosRiel,
  ): Promise<Array<{ velocidad: number; tipo: 'RIEL' | 'SOLDADURA'; total: number }>> {
    const params: any[] = [fechaDesde, fechaHasta, viaFiltro];

    const { condicionRiel: tramoCondicionRiel, condicionSold: tramoCondicionSold } =
      this.construirCondicionIds(tramoIds, params, 'f.tramo_id', 'cv.tramo_id');

    const condicionesRielExtra = this.construirCondicionesRiel(filtrosRiel, params);

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
          ${condicionesRielExtra}
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

    const sql = `
      WITH fallas_unificadas AS (
        ${partes.join(' UNION ALL ')}
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

  // ==========================================================
  // HELPERS PRIVADOS
  // ==========================================================

  /**
   * Construye condiciones SQL para filtros tipo "columna IN (...)"
   * con placeholders dinámicos seguros, para arrays NUMÉRICOS.
   *
   * @param ids       Array de IDs (si vacío/undefined, no genera condición)
   * @param params    Array acumulador de parámetros (se MUTA)
   * @param colRiel   Columna en tabla riel (o null si no aplica)
   * @param colSold   Columna en tabla soldadura (o null si solo aplica a riel)
   *
   * 🔒 los IDs nunca se concatenan al SQL; placeholders posicionales.
   */
  private construirCondicionIds(
    ids: number[] | undefined,
    params: any[],
    colRiel: string | null,
    colSold: string | null,
  ): { condicionRiel: string; condicionSold: string } {
    if (!ids?.length) {
      return { condicionRiel: '', condicionSold: '' };
    }

    const inicio = params.length + 1;
    const placeholders = ids.map((_, i) => `$${inicio + i}`).join(',');
    params.push(...ids);

    return {
      condicionRiel: colRiel ? `AND ${colRiel} IN (${placeholders})` : '',
      condicionSold: colSold ? `AND ${colSold} IN (${placeholders})` : '',
    };
  }

  /**
   * Variante para arrays de STRINGS (valores de enum).
   * Genera la condición solo para la parte RIEL (los enums nuevos
   * no aplican a soldadura).
   *
   * @param valores   Array de strings (si vacío/undefined, no genera)
   * @param params    Acumulador (se MUTA)
   * @param colRiel   Columna en fallas_riel
   */
  private construirCondicionEnumRiel(
    valores: string[] | undefined,
    params: any[],
    colRiel: string,
  ): string {
    if (!valores?.length) return '';

    const inicio = params.length + 1;
    const placeholders = valores.map((_, i) => `$${inicio + i}`).join(',');
    params.push(...valores);

    return `AND ${colRiel} IN (${placeholders})`;
  }

  /**
   * Construye TODAS las condiciones SQL específicas de RIEL en un solo
   * fragmento concatenable. Centraliza el manejo de los 7 filtros que
   * aplican solo a fallas_riel:
   *  - curvaHorizontalIds (Fase 1)
   *  - curvaVerticalIds (Fase 1)
   *  - tipoDefectos (Fase 2.D)
   *  - elementosAfectados (Fase 2.D)
   *  - zonasAfectadas (Fase 2.D)
   *  - perfiles (Fase 2.D)
   *  - estadosActuales (Fase 2.D)
   *
   * Cada condición se agrega solo si vienen valores. Si todo es vacío,
   * devuelve string vacío sin afectar la query.
   */
  private construirCondicionesRiel(
    filtros: FiltrosAnaliticosRiel | undefined,
    params: any[],
  ): string {
    if (!filtros) return '';

    const partes: string[] = [
      this.construirCondicionIds(filtros.curvaHorizontalIds, params, 'f.curva_horizontal_id', null).condicionRiel,
      this.construirCondicionIds(filtros.curvaVerticalIds, params, 'f.curva_vertical_id', null).condicionRiel,
      this.construirCondicionEnumRiel(filtros.tipoDefectos, params, 'f.tipo_defecto'),
      this.construirCondicionEnumRiel(filtros.elementosAfectados, params, 'f.elemento_afectado'),
      this.construirCondicionEnumRiel(filtros.zonasAfectadas, params, 'f.zona_afectada'),
      this.construirCondicionEnumRiel(filtros.perfiles, params, 'f.perfil'),
      this.construirCondicionEnumRiel(filtros.estadosActuales, params, 'f.estado_actual'),
    ];

    // Concatenar las que no son vacías (cada una ya viene con "AND " adelante)
    return partes.filter((p) => p.length > 0).join(' ');
  }
}

// ============================================================
// INTERFACE PÚBLICA
// ============================================================

/**
 * Filtros analíticos que aplican SOLO a fallas_riel.
 * Se pasan como un objeto opcional a los métodos de gráficos para
 * mantener firmas cortas y permitir crecer en el futuro sin romper.
 */
export interface FiltrosAnaliticosRiel {
  curvaHorizontalIds?: number[];
  curvaVerticalIds?: number[];
  tipoDefectos?: string[];
  elementosAfectados?: string[];
  zonasAfectadas?: string[];
  perfiles?: string[];
  estadosActuales?: string[];
}