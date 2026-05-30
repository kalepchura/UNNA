import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicionDesgaste } from '../entities/medicion-desgaste.entity';
import { TOLERANCIA_MAXIMA_MM } from '../../../common/constants/desgaste.constants';

/**
 * ============================================================
 * DesgasteAnalyticsRepository
 * ============================================================
 * Queries agregadas para KPIs y gráficos de Desgaste.
 *
 * NOTA: las mediciones de desgaste NO tienen soft delete
 * (sección 9.3.8), por lo tanto NO hay filtro `eliminado = false`
 * que aplicar. Las queries son directas sobre la tabla.
 *
 * NOTA W: los valores W pueden ser negativos (corrección de
 * calibración). No se aplica ningún filtro de signo.
 * ============================================================
 */
@Injectable()
export class DesgasteAnalyticsRepository {
  constructor(
    @InjectRepository(MedicionDesgaste)
    private readonly medRepo: Repository<MedicionDesgaste>,
  ) {}

  // ----------------------------------------------------------
  // KPI 1: Elementos en zona roja
  // ----------------------------------------------------------

  async contarElementosEnZonaRoja(): Promise<number> {
    const sql = `
      WITH ultimas AS (
        SELECT
          elemento_id,
          MAX(anio * 10 + trimestre) AS clave_max
        FROM mediciones_desgaste
        GROUP BY elemento_id
      )
      SELECT COUNT(DISTINCT m.elemento_id)::int AS total
      FROM mediciones_desgaste m
      JOIN ultimas u
        ON u.elemento_id = m.elemento_id
       AND (m.anio * 10 + m.trimestre) = u.clave_max
      WHERE
        (m.w1  IS NOT NULL AND m.w1  > $1) OR
        (m.w2  IS NOT NULL AND m.w2  > $1) OR
        (m.w3r IS NOT NULL AND m.w3r > $1) OR
        (m.w3l IS NOT NULL AND m.w3l > $1)
    `;
    const result = await this.medRepo.query(sql, [TOLERANCIA_MAXIMA_MM]);
    return result[0]?.total ?? 0;
  }

  // ----------------------------------------------------------
  // KPI 2: Elemento con mayor desgaste actual
  // ----------------------------------------------------------

  async obtenerElementoMayorDesgaste(): Promise<{
    codigoElemento: number;
    tramoCodigo: string;
    tramoNombre: string;
    via: string;
    punto: 'W1' | 'W2' | 'W3R' | 'W3L';
    valor: number;
    anio: number;
    trimestre: number;
  } | null> {
    const sql = `
      WITH ultimas AS (
        SELECT
          elemento_id,
          MAX(anio * 10 + trimestre) AS clave_max
        FROM mediciones_desgaste
        GROUP BY elemento_id
      ),
      ultimas_completas AS (
        SELECT m.*
        FROM mediciones_desgaste m
        JOIN ultimas u
          ON u.elemento_id = m.elemento_id
         AND (m.anio * 10 + m.trimestre) = u.clave_max
      ),
      desnormalizado AS (
        SELECT elemento_id, anio, trimestre, 'W1'::text AS punto, w1 AS valor FROM ultimas_completas WHERE w1 IS NOT NULL
        UNION ALL
        SELECT elemento_id, anio, trimestre, 'W2', w2 FROM ultimas_completas WHERE w2 IS NOT NULL
        UNION ALL
        SELECT elemento_id, anio, trimestre, 'W3R', w3r FROM ultimas_completas WHERE w3r IS NOT NULL
        UNION ALL
        SELECT elemento_id, anio, trimestre, 'W3L', w3l FROM ultimas_completas WHERE w3l IS NOT NULL
      )
      SELECT
        e.codigo_elemento::int AS "codigoElemento",
        tr.codigo              AS "tramoCodigo",
        tr.nombre              AS "tramoNombre",
        e.via                  AS "via",
        d.punto                AS "punto",
        d.valor::float8        AS "valor",
        d.anio::int            AS "anio",
        d.trimestre::int       AS "trimestre"
      FROM desnormalizado d
      JOIN elementos_desgaste e ON e.id = d.elemento_id
      JOIN tramos tr             ON tr.id = e.tramo_id
      ORDER BY d.valor DESC
      LIMIT 1
    `;
    const result = await this.medRepo.query(sql);
    return result.length > 0 ? result[0] : null;
  }

  // ----------------------------------------------------------
  // KPI 3: Elementos sin medición en el último año
  // ----------------------------------------------------------

  async obtenerAnioMaximoRegistrado(): Promise<number | null> {
    const result = await this.medRepo
      .createQueryBuilder('m')
      .select('MAX(m.anio)', 'maxAnio')
      .getRawOne<{ maxAnio: number | null }>();
    return result?.maxAnio ?? null;
  }

  async obtenerElementosSinMedicionEnAnio(
    anio: number,
    limite: number = 50,
  ): Promise<{
    cantidad: number;
    primeros: Array<{ codigoElemento: number; tramoCodigo: string; via: string }>;
  }> {
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM elementos_desgaste e
      WHERE NOT EXISTS (
        SELECT 1 FROM mediciones_desgaste m
        WHERE m.elemento_id = e.id AND m.anio = $1
      )
    `;
    const countResult = await this.medRepo.query(countSql, [anio]);
    const cantidad: number = countResult[0]?.total ?? 0;

    const detalleSql = `
      SELECT
        e.codigo_elemento::int AS "codigoElemento",
        tr.codigo              AS "tramoCodigo",
        e.via                  AS "via"
      FROM elementos_desgaste e
      JOIN tramos tr ON tr.id = e.tramo_id
      WHERE NOT EXISTS (
        SELECT 1 FROM mediciones_desgaste m
        WHERE m.elemento_id = e.id AND m.anio = $1
      )
      ORDER BY e.progresiva ASC
      LIMIT $2
    `;
    const primeros = await this.medRepo.query(detalleSql, [anio, limite]);
    return { cantidad, primeros };
  }

  // ----------------------------------------------------------
  // G1: mediciones con contexto (sin filtro por escenario)
  // ----------------------------------------------------------

  /**
   * Usado por G1. Carga mediciones filtradas por agrupación + vía + elementos.
   * Sin filtro de escenario (G1 trabaja con todas las mediciones).
   */
  async medicionesConContexto(
    tipoAgrupacion: 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL',
    valorAgrupacionId: number,
    via: 'PAR' | 'IMPAR' | 'AMBAS',
    elementoCodigos: number[],
  ): Promise<Array<{
    elementoId: number;
    codigoElemento: number;
    anio: number;
    trimestre: number;
    w1: number | null;
    w2: number | null;
    w3r: number | null;
    w3l: number | null;
  }>> {
    if (elementoCodigos.length === 0) return [];

    let condicionAgrupacion: string;
    switch (tipoAgrupacion) {
      case 'TRAMO':             condicionAgrupacion = 'tr.id = $1'; break;
      case 'CURVA_HORIZONTAL':  condicionAgrupacion = 'cH.id = $1'; break;
      case 'CURVA_VERTICAL':    condicionAgrupacion = 'cV.id = $1'; break;
      default: return [];
    }

    const condicionVia = via === 'AMBAS' ? '' : 'AND e.via = $3';

    const sql = `
      SELECT
        e.id              AS "elementoId",
        e.codigo_elemento AS "codigoElemento",
        m.anio            AS anio,
        m.trimestre       AS trimestre,
        m.w1::float8      AS w1,
        m.w2::float8      AS w2,
        m.w3r::float8     AS w3r,
        m.w3l::float8     AS w3l
      FROM mediciones_desgaste m
      JOIN elementos_desgaste e ON e.id = m.elemento_id
      JOIN tramos tr             ON tr.id = e.tramo_id
      LEFT JOIN curvas_horizontales cH ON cH.id = e.curva_horizontal_id
      LEFT JOIN curvas_verticales   cV ON cV.id = e.curva_vertical_id
      WHERE ${condicionAgrupacion}
        AND e.codigo_elemento = ANY($2::int[])
        ${condicionVia}
      ORDER BY e.codigo_elemento ASC, m.anio ASC, m.trimestre ASC
    `;

    const params: any[] = [valorAgrupacionId, elementoCodigos];
    if (via !== 'AMBAS') params.push(via);

    return this.medRepo.query(sql, params);
  }

  // ----------------------------------------------------------
  // G3: mediciones filtradas por escenario + múltiples agrupaciones
  // ----------------------------------------------------------

  /**
   * Carga mediciones para el G3, filtrando por:
   *  - escenarioId: las mediciones pertenecen a ese escenario
   *  - agrupación: múltiples ids de tramo/curvaH/curvaV
   *  - vía: PAR | IMPAR | AMBAS
   *  - elementoCodigos: lista de códigos (resolver previo en el service)
   *
   * Nota: W pueden ser negativos, no se filtra por signo.
   *
   * @param tipoAgrupacion tipo de agrupación espacial
   * @param agrupacionIds  lista de IDs del tramo/curva (ya validados)
   * @param via            filtro de vía
   * @param elementoCodigos códigos de elementos a incluir
   * @param escenarioId    ID del escenario (mediciones específicas de ese escenario)
   */
  async medicionesG3(
    tipoAgrupacion: 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL',
    agrupacionIds: number[],
    via: 'PAR' | 'IMPAR' | 'AMBAS',
    elementoCodigos: number[],
    escenarioId: number,
  ): Promise<Array<{
    elementoId: number;
    codigoElemento: number;
    via: string;
    riel: string;
    anio: number;
    trimestre: number;
    w1: number | null;
    w2: number | null;
    w3r: number | null;
    w3l: number | null;
  }>> {
    if (elementoCodigos.length === 0 || agrupacionIds.length === 0) return [];

    let condicionAgrupacion: string;
    switch (tipoAgrupacion) {
      case 'TRAMO':             condicionAgrupacion = 'tr.id = ANY($1::int[])'; break;
      case 'CURVA_HORIZONTAL':  condicionAgrupacion = 'cH.id = ANY($1::int[])'; break;
      case 'CURVA_VERTICAL':    condicionAgrupacion = 'cV.id = ANY($1::int[])'; break;
      default: return [];
    }

    const condicionVia = via === 'AMBAS' ? '' : 'AND e.via = $4';

    const sql = `
      SELECT
        e.id              AS "elementoId",
        e.codigo_elemento AS "codigoElemento",
        e.via             AS via,
        e.riel            AS riel,
        m.anio            AS anio,
        m.trimestre       AS trimestre,
        m.w1::float8      AS w1,
        m.w2::float8      AS w2,
        m.w3r::float8     AS w3r,
        m.w3l::float8     AS w3l
      FROM mediciones_desgaste m
      JOIN elementos_desgaste e ON e.id = m.elemento_id
      JOIN tramos tr             ON tr.id = e.tramo_id
      LEFT JOIN curvas_horizontales cH ON cH.id = e.curva_horizontal_id
      LEFT JOIN curvas_verticales   cV ON cV.id = e.curva_vertical_id
      WHERE ${condicionAgrupacion}
        AND e.codigo_elemento = ANY($2::int[])
        AND m.escenario_id = $3
        ${condicionVia}
      ORDER BY e.codigo_elemento ASC, m.anio ASC, m.trimestre ASC
    `;

    const params: any[] = [agrupacionIds, elementoCodigos, escenarioId];
    if (via !== 'AMBAS') params.push(via);

    return this.medRepo.query(sql, params);
  }

  // ----------------------------------------------------------
  // G3: resolver elementos por múltiples agrupaciones
  // ----------------------------------------------------------

  /**
   * Resuelve los códigos de elementos según la agrupación y vía,
   * aceptando múltiples IDs de agrupación.
   *
   * Usado por el service del G3 cuando el usuario no especifica
   * elementoCodigos explícitamente.
   */
  async resolverElementosPorAgrupacion(
    tipoAgrupacion: 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL',
    agrupacionIds: number[],
    via: 'PAR' | 'IMPAR' | 'AMBAS',
  ): Promise<number[]> {
    if (agrupacionIds.length === 0) return [];

    let condicionAgrupacion: string;
    switch (tipoAgrupacion) {
      case 'TRAMO':             condicionAgrupacion = 'e.tramo_id = ANY($1::int[])'; break;
      case 'CURVA_HORIZONTAL':  condicionAgrupacion = 'e.curva_horizontal_id = ANY($1::int[])'; break;
      case 'CURVA_VERTICAL':    condicionAgrupacion = 'e.curva_vertical_id = ANY($1::int[])'; break;
      default: return [];
    }

    const condicionVia = via === 'AMBAS' ? '' : 'AND e.via = $2';

    const sql = `
      SELECT e.codigo_elemento::int AS codigo
      FROM elementos_desgaste e
      WHERE ${condicionAgrupacion}
        ${condicionVia}
      ORDER BY e.progresiva ASC
    `;

    const params: any[] = [agrupacionIds];
    if (via !== 'AMBAS') params.push(via);

    const result = await this.medRepo.query(sql, params);
    return result.map((r: { codigo: number }) => r.codigo);
  }
}