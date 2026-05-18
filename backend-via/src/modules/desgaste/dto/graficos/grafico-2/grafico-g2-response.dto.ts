import { GraficoG2ConfigDto } from './grafico-g2-config.dto';

/**
 * Una línea del gráfico = un escenario.
 *
 * `datos`: misma longitud que `categorias` (años). Años donde el
 * escenario no tiene datos van como null.
 */
export class GraficoG2SerieDto {
  /** Código del escenario (= nombre, porque nombre es UNIQUE). */
  codigo!: string;
  nombre!: string;
  /** Valores de MTB acumulado en cada año. null donde no hay datos. */
  datos!: Array<number | null>;
}

export class GraficoG2MetadataDto {
  /** Cantidad de escenarios incluidos en el gráfico. */
  totalEscenarios!: number;
  calculadoEn!: Date;
}
export class GraficoG2ResponseDto {
  configAplicada!: GraficoG2ConfigDto;
  categorias!: string[];
  series!: GraficoG2SerieDto[];
  metadata!: GraficoG2MetadataDto;
}