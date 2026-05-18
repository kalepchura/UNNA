/**
 * Una fila de la grilla = un elemento de desgaste.
 *
 * Estructura de mediciones:
 *   mediciones[anio][trimestre] = { w1, w2, w3r, w3l }
 *
 * Ejemplo:
 *   mediciones: {
 *     2024: {
 *       1: { w1: 2.5, w2: 3.0, w3r: null, w3l: null },
 *       2: { w1: null, w2: null, w3r: null, w3l: null },
 *       ...
 *     },
 *     2025: { ... }
 *   }
 *
 * Si un (año, trimestre) no tiene registro en BD, los 4 W van como null.
 */
export class FilaGrillaDto {
  /** ID interno (lo usa el frontend al mandar cambios). */
  elementoId!: number;

  /** Código visible del elemento. */
  codigoElemento!: number;

  /** Para ordenar y mostrar en cabecera. */
  progresiva!: number;

  via!: string;
  tramoCodigo!: string;
  tramoNombre!: string;

  /**
   * Mediciones por año y trimestre.
   * Ej: mediciones[2024][1] = { w1: 2.5, w2: ..., w3r: ..., w3l: ... }
   */
  mediciones!: Record<
    number, // año
    Record<
      number, // trimestre 1-4
      {
        w1: number | null;
        w2: number | null;
        w3r: number | null;
        w3l: number | null;
      }
    >
  >;
}

export class GrillaResponseDto {
  /** Años incluidos en la grilla, en orden ascendente. */
  anios!: number[];

  /** Filas (elementos) ordenadas por progresiva ASC. */
  filas!: FilaGrillaDto[];

  /** Totales para mostrar en UI. */
  totalElementos!: number;
}