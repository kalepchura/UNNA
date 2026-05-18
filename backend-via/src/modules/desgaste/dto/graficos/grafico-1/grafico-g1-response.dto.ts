import { GraficoG1ConfigDto } from './grafico-g1-config.dto';
import { PuntoW } from '../../../../../common/enums';

/**
 * Un punto de la línea en el plano (MTB acumulado, desgaste mm).
 * Se incluye `anio` para el tooltip que dice "año correspondiente"
 * (informe G1).
 */
export class GraficoG1PuntoDto {
  /** Eje X: MTB acumulado (millones de toneladas). */
  x!: number;
  /** Eje Y: desgaste en mm. */
  y!: number;
  /** Año del que viene la medición (para tooltip). */
  anio!: number;
}

/**
 * Una línea = una combinación elemento + punto W.
 */
export class GraficoG1SerieDto {
  /** Identificador único de la línea: "ELEM-101-W1". */
  codigo!: string;
  /** Etiqueta legible: "Elemento 101 - W1". */
  nombre!: string;
  /** Solo el código del elemento (para agrupar en frontend). */
  codigoElemento!: number;
  /** El punto W que representa esta línea. */
  punto!: PuntoW;
  /** Puntos ordenados por año ASC. */
  puntos!: GraficoG1PuntoDto[];
}

export class GraficoG1MetadataDto {
  /** Cuántas líneas (combinaciones elemento×W) se devuelven. */
  totalLineas!: number;
  /** Cuántas mediciones únicas se procesaron. */
  totalMediciones!: number;
  /** Tolerancia de referencia (8 mm). El frontend dibuja la línea horizontal. */
  toleranciaMm!: number;
  calculadoEn!: Date;
}

export class GraficoG1ResponseDto {
  /** Config aplicada (mismo que llegó). */
  configAplicada!: GraficoG1ConfigDto;
  series!: GraficoG1SerieDto[];
  metadata!: GraficoG1MetadataDto;
}