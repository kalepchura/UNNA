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

  /**
   * Cuenta elementos cuyo ÚLTIMO REGISTRO tiene al menos un W
   * superior a TOLERANCIA_MAXIMA_MM.
   *
   * "Último registro" = el (año, trimestre) más reciente de cada elemento.
   *
   * Estrategia SQL:
   *  1. CTE `ultimas`: por cada elemento, el (año, trimestre) máximo
   *  2. JOIN con la tabla para traer los W de ese registro
   *  3. WHERE alguno de los W > tolerancia
   *  4. COUNT distinct elementos
   */
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

  /**
   * Encuentra el elemento con el mayor valor W en su último registro,
   * con todo el contexto (código, tramo, vía, qué punto W).
   *
   * Estrategia SQL:
   *  1. CTE `ultimas`: último (año, trimestre) por elemento
   *  2. JOIN para traer los W de ese registro
   *  3. UNNEST de los 4 W con sus etiquetas
   *  4. ORDER BY valor DESC, LIMIT 1
   */
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
        -- Convertimos las 4 columnas W en filas (etiqueta, valor)
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

  /**
   * Devuelve el año máximo registrado en la tabla. null si está vacía.
   */
  async obtenerAnioMaximoRegistrado(): Promise<number | null> {
    const result = await this.medRepo
      .createQueryBuilder('m')
      .select('MAX(m.anio)', 'maxAnio')
      .getRawOne<{ maxAnio: number | null }>();

    return result?.maxAnio ?? null;
  }

  /**
   * Lista elementos que NO tienen NINGUNA medición en el año dado.
   *
   * Estrategia SQL:
   *  - LEFT JOIN entre elementos y mediciones de ese año
   *  - WHERE no encontró match (m.id IS NULL)
   *  - LIMIT para no traer demasiado
   */
  async obtenerElementosSinMedicionEnAnio(
    anio: number,
    limite: number = 50,
  ): Promise<{
    cantidad: number;
    primeros: Array<{ codigoElemento: number; tramoCodigo: string; via: string }>;
  }> {
    // Conteo total
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

    // Primeros N para mostrar
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
  // GRÁFICOS G1 y G3: cargar mediciones con contexto
  // ----------------------------------------------------------

  /**
   * Carga mediciones de los elementos seleccionados, ya filtradas
   * por tramo/curva y vía.
   *
   * Devuelve una fila por (elemento, año, trimestre) con sus 4 W.
   * El service las desnormaliza por puntoW y agrega por año.
   *
   * @param tipoAgrupacion 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL'
   * @param valorAgrupacion código del tramo/curva (validado por whitelist
   *                        del wizard, seguro para concatenar columnas)
   * @param via             'PAR' | 'IMPAR' | 'AMBAS'
   * @param elementoCodigos lista de códigos de elementos a incluir
   *
   * NOTA SQL: el filtro por agrupación cambia la columna del JOIN
   * según el tipoAgrupacion. Usamos whitelist segura.
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
    case 'TRAMO':
      condicionAgrupacion = 'tr.id = $1';
      break;
    case 'CURVA_HORIZONTAL':
      condicionAgrupacion = 'cH.id = $1';
      break;
    case 'CURVA_VERTICAL':
      condicionAgrupacion = 'cV.id = $1';
      break;
    default:
      return [];
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
}