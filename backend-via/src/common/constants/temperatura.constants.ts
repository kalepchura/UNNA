/**
 * ============================================================
 * CONSTANTES DE VALIDACIÓN DEL MÓDULO TEMPERATURA
 * ============================================================
 * Centralizadas para que un cambio de rango/umbral o tamaño
 * de archivo se haga aquí y se propague a:
 *  - Parsers (validación por fila)
 *  - Service de KPIs (umbrales del semáforo)
 *  - Controller (validación de tamaño de archivo)
 *
 * Si la concesionaria define oficialmente otros valores, solo
 * se modifica este archivo.
 * ============================================================
 */

/** Rango válido de temperatura para los parsers (filas fuera = inválidas). */
export const TEMPERATURA_VALIDACION = {
  MIN_CELSIUS: -10,
  MAX_CELSIUS: 60,
} as const;

/** Tamaño máximo permitido al subir un archivo de temperatura. */
export const TEMPERATURA_ARCHIVO = {
  MAX_BYTES: 10 * 1024 * 1024, // 10 MB
} as const;

/**
 * Umbrales de los semáforos en KPIs (informe sección 9.2.5).
 * Documentados aquí para tener todo el conocimiento de dominio
 * del módulo en un solo archivo.
 */
export const TEMPERATURA_KPI = {
  /** KPI 1 — Temperatura máxima del último mes. */
  KPI1: {
    UMBRAL_AMARILLO: 36, // 36-45 = amarillo
    UMBRAL_ROJO: 46,     // > 45 = rojo (≥ 46 técnicamente)
  },
  /** KPI 2 — Cantidad de zonas en alerta del año. */
  KPI2: {
    UMBRAL_AMARILLO: 1,  // 1-2 = amarillo
    UMBRAL_ROJO: 3,      // ≥ 3 = rojo
  },
  /** KPI 3 — Días consecutivos en alerta. */
  KPI3: {
    UMBRAL_AMARILLO: 4,  // 4-7 = amarillo
    UMBRAL_ROJO: 8,      // > 7 = rojo (≥ 8)
    /** Umbral de °C para considerar un registro "en alerta". */
    UMBRAL_ALERTA_CELSIUS: 45,
  },
} as const;

