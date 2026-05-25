/**
 * ============================================================
 * CONSTANTES DEL MAPA DE CALOR
 * ============================================================
 * Umbrales centralizados de cada capa.
 *
 * IMPORTANTE: si la concesionaria cambia algún umbral, se
 * modifica AQUÍ y el cambio se propaga a todas las capas.
 *
 * Referencia: Informe sección 8.
 * ============================================================
 */

// ------------------------------------------------------------
// CAPA TEMPERATURA (sección 8 - Capa Temperatura)
// ------------------------------------------------------------
export const MAPA_TEMPERATURA = {
  /** Verde: 0 a 44 °C. */
  UMBRAL_VERDE_MAX: 44,
  /** Amarillo: 45 a 49 °C. */
  UMBRAL_AMARILLO_MAX: 49,
  // Rojo: > 49 °C 
  
} as const;

// ------------------------------------------------------------
// CAPA DESGASTE — MODO GENERAL (mm)
// ------------------------------------------------------------
export const MAPA_DESGASTE_GENERAL = {
  /** Verde: < 2 mm. */
  UMBRAL_VERDE_MAX: 2,
  /** Amarillo: 2 a 3.4 mm. */
  UMBRAL_AMARILLO_MAX: 3.4,
  // Rojo: >= 3.5 mm
} as const;

// ------------------------------------------------------------
// CAPA DESGASTE — MODO POR ÍNDICE (ratio)
// ------------------------------------------------------------
export const MAPA_DESGASTE_INDICE = {
  /** Verde: < 1.2. */
  UMBRAL_VERDE_MAX: 1.2,
  /** Amarillo: 1.2 a 1.5. */
  UMBRAL_AMARILLO_MAX: 1.5,
  // Rojo: > 1.5
} as const;

// ------------------------------------------------------------
// CAPA FALLAS (cualquier segmentación)
// ------------------------------------------------------------
export const MAPA_FALLAS = {
  /**
   * Verde: 0 a 2 fallas.
   * NOTA: el informe dice "si no hay dato es verde". Por eso
   * la capa Fallas usa VERDE como default cuando no hay datos
   * (a diferencia de Temperatura/Desgaste que usan GRIS).
   */
  UMBRAL_VERDE_MAX: 2,
  /** Amarillo: 3 a 4 fallas. */
  UMBRAL_AMARILLO_MAX: 4,
  // Rojo: >= 5
} as const;

// ------------------------------------------------------------
// DEFAULTS DE FILTROS
// ------------------------------------------------------------

/**
 * Default rango Fallas: últimos 12 meses desde hoy.
 * Se calcula al momento de la consulta (no es estático).
 */
export const FALLAS_RANGO_DEFAULT_MESES = 12;