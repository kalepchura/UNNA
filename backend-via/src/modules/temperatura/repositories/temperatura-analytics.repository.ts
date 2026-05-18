import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temperatura } from '../entities/temperatura.entity';
import { TEMPERATURA_KPI } from '../../../common/constants/temperatura.constants';

/**
 * ============================================================
 * TemperaturaAnalyticsRepository
 * ============================================================
 * Queries agregadas para KPIs y gráficos de Temperatura.
 *
 * REGLA DE ORO del módulo: cada query hace JOIN con
 * temperatura_importaciones y filtra por imp.eliminado = false.
 * Esto garantiza que registros de importaciones eliminadas
 * NUNCA aparezcan en cálculos.
 * ============================================================
 */
@Injectable()
export class TemperaturaAnalyticsRepository {
  constructor(
    @InjectRepository(Temperatura)
    private readonly tempRepo: Repository<Temperatura>,
  ) {}

  // ----------------------------------------------------------
  // KPI 1: Temperatura máxima del último mes
  // ----------------------------------------------------------

  /**
   * Devuelve el registro de mayor temperatura del rango dado,
   * con el contexto de su importación (progresiva, tramo, fecha).
   *
   * Usa LIMIT 1 con ORDER BY DESC en lugar de MAX porque
   * necesitamos también progresiva/tramo/fecha del registro.
   */
  async obtenerMaxEnRango(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{
    temperatura: number;
    progresiva: number;
    tramoCodigo: string;
    tramoNombre: string;
    fecha: Date;
  } | null> {
    const sql = `
      SELECT
        t.temperatura::float8 AS temperatura,
        imp.progresiva        AS progresiva,
        tr.codigo             AS "tramoCodigo",
        tr.nombre             AS "tramoNombre",
        t.fecha               AS fecha
      FROM temperaturas t
      JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
      JOIN tramos tr ON tr.id = imp.tramo_id
      WHERE imp.eliminado = false
        AND t.fecha BETWEEN $1 AND $2
      ORDER BY t.temperatura DESC, t.fecha DESC
      LIMIT 1
    `;

    const result = await this.tempRepo.query(sql, [fechaDesde, fechaHasta]);
    return result.length > 0 ? result[0] : null;
  }

  // ----------------------------------------------------------
  // KPI 2: Zonas en alerta del año
  // ----------------------------------------------------------

  /**
   * Devuelve los tramos distintos que tuvieron al menos un
   * registro > UMBRAL_ALERTA_CELSIUS dentro del rango dado.
   *
   * "Zona en alerta" = tramo con cualquier registro sobre el umbral.
   */
  async obtenerTramosEnAlerta(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<Array<{ codigo: string; nombre: string }>> {
    const sql = `
      SELECT DISTINCT
        tr.codigo AS codigo,
        tr.nombre AS nombre
      FROM temperaturas t
      JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
      JOIN tramos tr ON tr.id = imp.tramo_id
      WHERE imp.eliminado = false
        AND t.fecha BETWEEN $1 AND $2
        AND t.temperatura > $3
      ORDER BY tr.codigo ASC
    `;

    return this.tempRepo.query(sql, [
      fechaDesde,
      fechaHasta,
      TEMPERATURA_KPI.KPI3.UMBRAL_ALERTA_CELSIUS,
    ]);
  }

  // ----------------------------------------------------------
  // KPI 3 (paso 1): Tramo con mayor promedio últimos 30 días
  // ----------------------------------------------------------

  /**
   * Identifica el tramo con mayor promedio de temperatura
   * en el rango. Si no hay datos, devuelve null.
   */
  async obtenerTramoConMayorPromedio(
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<{
    tramoId: number;
    codigo: string;
    nombre: string;
    promedio: number;
  } | null> {
    const sql = `
      SELECT
        tr.id     AS "tramoId",
        tr.codigo AS codigo,
        tr.nombre AS nombre,
        AVG(t.temperatura)::float8 AS promedio
      FROM temperaturas t
      JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
      JOIN tramos tr ON tr.id = imp.tramo_id
      WHERE imp.eliminado = false
        AND t.fecha BETWEEN $1 AND $2
      GROUP BY tr.id, tr.codigo, tr.nombre
      ORDER BY promedio DESC
      LIMIT 1
    `;

    const result = await this.tempRepo.query(sql, [fechaDesde, fechaHasta]);
    return result.length > 0 ? result[0] : null;
  }

  // ----------------------------------------------------------
  // KPI 3 (paso 2): Días consecutivos en alerta hasta hoy
  // ----------------------------------------------------------

  /**
   * Para un tramo dado, devuelve los días con al menos un
   * registro > UMBRAL_ALERTA_CELSIUS, en orden descendente
   * (hoy hacia atrás).
   *
   * El service determina cuántos son CONSECUTIVOS hasta hoy.
   * Limitamos a últimos 60 días por seguridad (más que suficiente
   * para un KPI cuyo umbral rojo es >7).
   */
  async obtenerDiasEnAlertaPorTramo(
    tramoId: number,
    diasHaciaAtras = 60,
  ): Promise<Date[]> {
    // Ventana hacia atrás desde hoy
    const hoy = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - diasHaciaAtras);

    const sql = `
      SELECT DISTINCT t.fecha AS fecha
      FROM temperaturas t
      JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
      WHERE imp.eliminado = false
        AND imp.tramo_id = $1
        AND t.fecha BETWEEN $2 AND $3
        AND t.temperatura > $4
      ORDER BY t.fecha DESC
    `;

    const rows: Array<{ fecha: Date }> = await this.tempRepo.query(sql, [
      tramoId,
      desde,
      hoy,
      TEMPERATURA_KPI.KPI3.UMBRAL_ALERTA_CELSIUS,
    ]);

    // Postgres devuelve `fecha` como Date object (TypeORM lo parsea)
    return rows.map((r) => new Date(r.fecha));
  }

  // ----------------------------------------------------------
  // GRÁFICO G1: Serie temporal por tramo
  // ----------------------------------------------------------

  /**
   * Devuelve temperaturas agregadas por (tramo, periodo) usando
   * MIN/AVG/MAX según `tipoValor`.
   *
   * El "periodo" es un entero que representa:
   *  - DIARIA:  día del año (1-366)
   *  - MENSUAL: mes (1-12)
   *  - ANUAL:   año (ej. 2024)
   *
   * El service lo convierte en categoría del eje X.
   */
  async serieTemporal(
  granularidad: 'DIARIA' | 'MENSUAL' | 'ANUAL',
  tramoIds: number[],
  fechaDesde: Date,
  fechaHasta: Date,
): Promise<Array<{
  tramoId: number;
  codigo: string;
  nombre: string;
  periodo: number;
  min: number;
  avg: number;
  max: number;
  fecha: string;
}>> {
  if (tramoIds.length === 0) return [];

  let extractExpr: string;
  if (granularidad === 'DIARIA') {
    extractExpr = "EXTRACT(DOY FROM t.fecha)::int";
  } else if (granularidad === 'MENSUAL') {
    extractExpr = "EXTRACT(MONTH FROM t.fecha)::int";
  } else {
    extractExpr = "EXTRACT(YEAR FROM t.fecha)::int";
  }

  const sql = `
    SELECT
      tr.id     AS "tramoId",
      tr.codigo AS codigo,
      tr.nombre AS nombre,
      ${extractExpr}                AS periodo,
      MIN(t.temperatura)::float8   AS min,
      AVG(t.temperatura)::float8   AS avg,
      MAX(t.temperatura)::float8   AS max,
      MIN(t.fecha::date)::text     AS fecha
    FROM temperaturas t
    JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
    JOIN tramos tr ON tr.id = imp.tramo_id
    WHERE imp.eliminado = false
      AND tr.id = ANY($1::int[])
      AND t.fecha BETWEEN $2 AND $3
    GROUP BY tr.id, tr.codigo, tr.nombre, periodo
    ORDER BY tr.orden ASC, periodo ASC
  `;

  return this.tempRepo.query(sql, [tramoIds, fechaDesde, fechaHasta]);
}

  /**
   * Conteo total de registros en el rango (para metadata.totalRegistros).
   */
  async contarRegistrosEnRango(
    tramoIds: number[],
    fechaDesde: Date,
    fechaHasta: Date,
  ): Promise<number> {
    if (tramoIds.length === 0) return 0;

    const sql = `
      SELECT COUNT(*)::int AS total
      FROM temperaturas t
      JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
      WHERE imp.eliminado = false
        AND imp.tramo_id = ANY($1::int[])
        AND t.fecha BETWEEN $2 AND $3
    `;

    const result = await this.tempRepo.query(sql, [tramoIds, fechaDesde, fechaHasta]);
    return result[0]?.total ?? 0;
  }

  // ----------------------------------------------------------
  // GRÁFICO G2: Comparación entre tramos
  // ----------------------------------------------------------

  /**
   * Devuelve un valor agregado por tramo (MIN/AVG/MAX) sobre
   * todos los registros del tramo dentro del rango.
   *
   * Devuelve también la cantidad de mediciones por tramo (count),
   * que se incluye en el response para que el usuario sepa cuán
   * confiable es cada barra.
   */
  async comparacionEntreTramos(
  tramoIds: number[],
  fechaDesde: Date,
  fechaHasta: Date,
): Promise<Array<{
  tramoId: number;
  codigo: string;
  nombre: string;
  min: number;
  avg: number;
  max: number;
  cantidad: number;
}>> {
  if (tramoIds.length === 0) return [];

  const sql = `
    SELECT
      tr.id     AS "tramoId",
      tr.codigo AS codigo,
      tr.nombre AS nombre,
      MIN(t.temperatura)::float8   AS min,
      AVG(t.temperatura)::float8   AS avg,
      MAX(t.temperatura)::float8   AS max,
      COUNT(*)::int                AS cantidad
    FROM temperaturas t
    JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
    JOIN tramos tr ON tr.id = imp.tramo_id
    WHERE imp.eliminado = false
      AND tr.id = ANY($1::int[])
      AND t.fecha BETWEEN $2 AND $3
    GROUP BY tr.id, tr.codigo, tr.nombre
    ORDER BY tr.orden ASC
  `;

  return this.tempRepo.query(sql, [tramoIds, fechaDesde, fechaHasta]);
}

  // ----------------------------------------------------------
  // GRÁFICO G3: Patrón horario
  // ----------------------------------------------------------

  /**
   * Devuelve temperaturas agregadas por (tramo, hora del día)
   * sobre todos los registros del rango.
   *
   * EXTRACT(HOUR FROM hora) → entero 0-23
   * Útil para construir un "promedio típico" de cada hora del día.
   *
   * Aprovecha el índice (fecha, hora) que ya tenemos en la tabla.
   */
  async patronHorario(
  tramoIds: number[],
  fechaDesde: Date,
  fechaHasta: Date,
): Promise<Array<{
  tramoId: number;
  codigo: string;
  nombre: string;
  hora: number;
  min: number;
  avg: number;
  max: number;
  cantidad: number;
}>> {
  if (tramoIds.length === 0) return [];

  const sql = `
    SELECT
      tr.id     AS "tramoId",
      tr.codigo AS codigo,
      tr.nombre AS nombre,
      EXTRACT(HOUR FROM t.hora)::int       AS hora,
      MIN(t.temperatura)::float8           AS min,
      AVG(t.temperatura)::float8           AS avg,
      MAX(t.temperatura)::float8           AS max,
      COUNT(*)::int                        AS cantidad
    FROM temperaturas t
    JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
    JOIN tramos tr ON tr.id = imp.tramo_id
    WHERE imp.eliminado = false
      AND tr.id = ANY($1::int[])
      AND t.fecha BETWEEN $2 AND $3
    GROUP BY tr.id, tr.codigo, tr.nombre, hora
    ORDER BY tr.orden ASC, hora ASC
  `;

  return this.tempRepo.query(sql, [tramoIds, fechaDesde, fechaHasta]);
}
}