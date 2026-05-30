// backend/src/modules/fallas/dto/graficos/grafico-2/grafico-2-response.dto.ts

import { NivelAnalisis, ModoG2 } from '../../../enums/fallas-graficos.enums';

/**
 * Una serie del gráfico.
 *
 *  - Modo CATEGORIA: hay UNA sola serie llamada "Total", con un valor
 *    por cada categoría (eje X). `datos.length === categorias.length`.
 *
 *  - Modo ELEMENTO: hay N series (una por opción del enum),
 *    cada una con un valor por cada elemento (eje X).
 *    `datos.length === categorias.length` (que aquí son los elementos).
 */
export class Grafico2SerieDto {
  /** Nombre legible para la leyenda. */
  nombre!: string;
  /** Código estable (la clave del enum, o 'TOTAL'). */
  codigo!: string;
  /** Valores. Misma longitud que `categorias`. */
  datos!: number[];
}

export class Grafico2MetadataDto {
  totalFallas!: number;
  calculadoEn!: Date;
  nivel?: NivelAnalisis;
  modo?: ModoG2;
  mensaje?: string;
}

export class Grafico2ResponseDto {
  /**
   * Etiquetas del eje X.
   *  - Modo CATEGORIA: opciones del enum elegido.
   *  - Modo ELEMENTO : nombres/códigos de los elementos seleccionados.
   */
  categorias!: string[];

  series!: Grafico2SerieDto[];

  metadata!: Grafico2MetadataDto;
}