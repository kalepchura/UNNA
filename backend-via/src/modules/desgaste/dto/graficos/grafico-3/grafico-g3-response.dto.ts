import { GraficoG3ConfigDto } from './grafico-g3-config.dto';
import { PuntoW } from '../../../../../common/enums';

/**
 * Un punto en el plano (x = MTB acumulado, y = desgaste mm).
 * El año va en el tooltip del frontend.
 *
 * Nota: y puede ser negativo (corrección de calibración).
 */
export class GraficoG3PuntoDto {
  /** MTB acumulado del escenario en ese año (eje X). */
  x!: number;

  /** Desgaste medido en mm (eje Y). Puede ser negativo. */
  y!: number;

  /** Año de la medición (para tooltip). */
  anio!: number;

  /** Trimestre del dato tomado (el último del año). Para tooltip. */
  trimestre!: number;
}

/**
 * Una línea del gráfico = elemento + puntoW + escenario.
 */
export class GraficoG3SerieDto {
  /**
   * ID único de la línea.
   * Formato: "ELEM-{codigo}-{puntoW}-ESC-{escenarioId}"
   * Ejemplo: "ELEM-101-W1-ESC-2"
   */
  id!: string;

  /**
   * Etiqueta legible para la leyenda.
   * Formato: "Elem. {codigo} · {puntoW} · {escenarioNombre}"
   */
  nombre!: string;

  codigoElemento!: number;
  punto!: PuntoW;
  escenarioId!: number;
  escenarioNombre!: string;

  /** Índice de la config que generó esta serie (0-based). */
  configIndex!: number;

  puntos!: GraficoG3PuntoDto[];
}

/**
 * Info de un escenario presente en la respuesta.
 * El frontend puede mostrar esto en la leyenda o título.
 */
export class GraficoG3EscenarioInfoDto {
  id!: number;
  nombre!: string;
  /** MTB acumulado máximo del escenario (útil para escala del eje X). */
  mtbMaximo!: number;
  /** Primer año con datos de MTB en este escenario. */
  anioInicio!: number;
  /** Último año con datos de MTB en este escenario. */
  anioFin!: number;
}

export class GraficoG3MetadataDto {
  /** Escenarios únicos presentes en la respuesta. */
  escenarios!: GraficoG3EscenarioInfoDto[];

  /** Total de líneas generadas. */
  totalLineas!: number;

  /** Total de mediciones procesadas (antes de deduplicar por año). */
  totalMediciones!: number;

  /** Tolerancia máxima en mm (para línea de referencia en el gráfico). */
  toleranciaMm!: number;

  /** Configs que no generaron ninguna línea (sin datos). */
  configsSinDatos!: number[];

  calculadoEn!: Date;
}

export class GraficoG3ResponseDto {
  /** Configs efectivamente aplicadas (con defaults resueltos). */
  configuracionesAplicadas!: GraficoG3ConfigDto[];

  series!: GraficoG3SerieDto[];
  metadata!: GraficoG3MetadataDto;
}