/**
 * Un tramo en el esquema base.
 * Usado por el frontend para dibujar segmentos etiquetados.
 */
export class TramoEsquemaDto {
  codigo!: string;
  nombre!: string;
  progresivaInicio!: number;
  progresivaFin!: number;
}

/**
 * Una estación en el esquema base.
 * Usado por el frontend para marcadores verticales.
 */
export class EstacionEsquemaDto {
  codigo!: string;
  nombre!: string;
  progresiva!: number;
}

/**
 * Esquema base de la Línea 1 (estructura geométrica).
 *
 * No depende de los datos transaccionales (fallas, temperatura,
 * desgaste). Solo depende del catálogo. Por eso es un endpoint
 * GET (cacheable, idempotente).
 */
export class EsquemaBaseResponseDto {
  /** Progresiva mínima de la línea (típicamente 0). */
  progresivaMinima!: number;

  /** Progresiva máxima (final de la línea). */
  progresivaMaxima!: number;

  /** Tramos ordenados por progresivaInicio ASC. */
  tramos!: TramoEsquemaDto[];

  /** Estaciones ordenadas por progresiva ASC. */
  estaciones!: EstacionEsquemaDto[];

  /** Total de tramos (atajo para UI). */
  totalTramos!: number;

  /** Total de estaciones. */
  totalEstaciones!: number;

  /** Timestamp del cálculo (para debugging). */
  generadoEn!: Date;
}