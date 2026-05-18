/**
 * ============================================================
 * CONSTANTES DEL MÓDULO DESGASTE
 * ============================================================
 * Centralizadas para que cualquier ajuste al dominio se haga
 * aquí sin tocar lógica.
 * ============================================================
 */

/**
 * Tolerancia máxima de desgaste en mm (informe sección 9.3.4).
 * Aplica a TODOS los puntos (W1/W2/W3R/W3L) y TODOS los perfiles
 * (100RE/115RE).
 *
 * Cuando un valor medido supera este umbral, el riel está en
 * zona roja (límite de vida útil).
 *
 * Se usa en:
 *  - KPI 1 (elementos en zona roja)
 *  - Línea horizontal de referencia en gráficos G1 y G3
 */
export const TOLERANCIA_MAXIMA_MM = 8;

/** Trimestres válidos para mediciones. */
export const TRIMESTRES_VALIDOS = [1, 2, 3, 4] as const;

/** Año mínimo aceptado en mediciones y MTB (informe). */
export const ANIO_MINIMO = 2012;

/**
 * Puntos de medición de desgaste.
 * Los 4 valores que se miden por elemento por trimestre.
 */
export const PUNTOS_MEDICION_W = ['W1', 'W2', 'W3R', 'W3L'] as const;
export type PuntoMedicionW = typeof PUNTOS_MEDICION_W[number];

/** Nombre canónico del escenario REAL (informe sección 9.3.5 G1). */
export const ESCENARIO_REAL_NOMBRE = 'REAL';


/**
 * Umbrales de los semáforos en KPIs de Desgaste.
 *
 * NOTA: el informe (9.3.7) no especifica colores explícitamente.
 * Estos umbrales son orientativos. Si la concesionaria define
 * otros, se cambian aquí.
 */
export const DESGASTE_KPI = {
  /** KPI 1 — Elementos en zona roja. */
  KPI1: {
    UMBRAL_AMARILLO: 1,  // 1+ ya es preocupante
    UMBRAL_ROJO: 5,      // 5+ es crítico
  },
  /** KPI 2 — Mayor desgaste actual. Compara contra TOLERANCIA_MAXIMA_MM. */
  KPI2: {
    UMBRAL_AMARILLO: 6,  // 6-8 mm = amarillo (cerca del límite)
    UMBRAL_ROJO: 8,      // > 8 mm = rojo (sobre tolerancia)
  },
  /** KPI 3 — Elementos sin medición en último año. */
  KPI3: {
    UMBRAL_AMARILLO: 1,  // 1+ desactualizados
    UMBRAL_ROJO: 6,      // 6+ son demasiados
  },
} as const;