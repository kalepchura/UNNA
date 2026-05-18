import { Grafico3ConfigDto } from './grafico-3-config.dto';

/**
 * Una serie del gráfico:
 *  - sin apilamiento → 1 serie llamada "Total"
 *  - con apilamiento → 2 series: "Riel" y "Soldadura"
 */
export class Grafico3SerieDto {
  /** Nombre legible para la leyenda. */
  nombre!: string;

  /** Identificador estable (TOTAL, RIEL, SOLDADURA). */
  codigo!: string;

  /**
   * Valores de cada barra. Misma longitud que `categorias`.
   * Las velocidades sin datos van con 0.
   */
  datos!: number[];
}

export class Grafico3MetadataDto {
  totalFallas!: number;
  calculadoEn!: Date;
}

export class Grafico3ResponseDto {
  configAplicada!: Required<Grafico3ConfigDto>;

  /**
   * Velocidades del catálogo en orden ascendente.
   * Ej: ['40 km/h', '50 km/h', '60 km/h', '80 km/h']
   */
  categorias!: string[];

  series!: Grafico3SerieDto[];

  metadata!: Grafico3MetadataDto;
}