import { GraficoG3ConfigDto } from './grafico-g3-config.dto';
import { PuntoW } from '../../../../../common/enums';

/**
 * Punto de la línea en el plano (MTB acumulado del escenario, mm).
 */
export class GraficoG3PuntoDto {
  /** MTB acumulado del escenario seleccionado en ese año. */
  x!: number;
  /** Desgaste medido (mm). */
  y!: number;
  /** Año correspondiente (para tooltip). */
  anio!: number;
}

export class GraficoG3SerieDto {
  /** Identificador único: "ELEM-101-W1-Optimista". */
  codigo!: string;
  /** Etiqueta legible: "Elem. 101 - W1". (Escenario va en metadata global) */
  nombre!: string;
  codigoElemento!: number;
  punto!: PuntoW;
  /** Código del escenario al que pertenece. */
  escenarioCodigo!: string;
  puntos!: GraficoG3PuntoDto[];
}

export class GraficoG3MetadataDto {
  /** Nombre del escenario (para mostrar en título del gráfico). */
  escenarioNombre!: string;
  totalLineas!: number;
  totalMediciones!: number;
  toleranciaMm!: number;
  calculadoEn!: Date;
}

export class GraficoG3ResponseDto {
  configAplicada!: GraficoG3ConfigDto;
  series!: GraficoG3SerieDto[];
  metadata!: GraficoG3MetadataDto;
}