// backend/src/modules/fallas/dto/graficos/grafico-1/grafico-1-response.dto.ts

import { NivelAnalisis } from '../../../enums/fallas-graficos.enums';

/**
 * Una serie del gráfico = una línea = un elemento del nivel.
 */
export class Grafico1SerieDto {
  /** Nombre legible para la leyenda. */
  nombre!: string;
  /** Código corto (puede ser igual al nombre). */
  codigo!: string;
  /** ID del elemento (tramo, curva o cambiavía). */
  elementoId!: number;
  /** Valores de cada categoría. Misma longitud que `categorias`. */
  datos!: number[];
}

export class Grafico1MetadataDto {
  totalFallas!: number;
  calculadoEn!: Date;
  /** Nivel efectivamente aplicado (útil al front para etiquetar). */
  nivel?: NivelAnalisis;
  /**
   * Mensaje cuando la config no es válida y se devolvió vacío.
   * Si la consulta corrió, queda undefined.
   */
  mensaje?: string;
}

/**
 * Response del Gráfico 1.
 *
 * NO devuelve `configAplicada`: el front ya tiene la config que envió.
 * Solo devolvemos los datos para dibujar + metadata informativa.
 */
export class Grafico1ResponseDto {
  /**
   * Etiquetas del eje X.
   *  - MENSUAL: ['Ene','Feb',...,'Dic']
   *  - ANUAL  : ['2020','2021',...,'2026']
   */
  categorias!: string[];

  /** Una serie por elemento del nivel. Puede venir vacío. */
  series!: Grafico1SerieDto[];

  metadata!: Grafico1MetadataDto;
}