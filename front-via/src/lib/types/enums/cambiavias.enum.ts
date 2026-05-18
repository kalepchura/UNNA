/**
 * ============================================================
 * ENUMS DEL CATÁLOGO CAMBIAVÍAS
 * ============================================================
 * Atributos técnicos de los cambiavías de la línea.
 * Usados por:
 *   - Catálogo de cambiavías (CRUD)
 *   - Falla Soldadura Inox (al mostrar el cambiavía relacionado)
 *
 * Espejo exacto del backend en:
 *   src/common/enums/index.ts (sección "CATÁLOGO CAMBIAVÍAS")
 * ============================================================
 */

/**
 * Geometría del cambiavía (relación de cambio).
 *
 * El número expresa la pendiente del cambio:
 * por cada N unidades a lo largo, se desplaza 1 unidad lateral.
 * Cuanto mayor el número, más suave el cambio (mayor velocidad permitida).
 *
 * - 0:12 → cambio especial
 * - 1:7, 1:8, 1:10 → relaciones estándar
 */
export enum TipoCambiavia {
  T_0_12 = '0:12',
  T_1_7 = '1:7',
  T_1_8 = '1:8',
  T_1_10 = '1:10',
}

/**
 * Norma técnica de fabricación del cambiavía.
 *
 * - AREMA: estándar norteamericano
 * - AREMA_ASCE_75: variante AREMA con perfil ASCE 75
 * - UIC: estándar europeo (Union Internationale des Chemins de fer)
 * - UNIFER_36 / UNIFER_50: normas UNIFER
 */
export enum NormaCambiavia {
  AREMA = 'AREMA',
  AREMA_ASCE_75 = 'AREMA_ASCE_75',
  UIC = 'UIC',
  UNIFER_36 = 'UNIFER_36',
  UNIFER_50 = 'UNIFER_50',
}

/**
 * Tipo de aguja del cambiavía (parte móvil del cambio).
 *
 * - NA: no aplica (cambiavía sin aguja diferenciada)
 * - CURVA: aguja curva (cambio en curva)
 * - RECTA: aguja recta (cambio en tangente)
 */
export enum TipoAguja {
  NA = 'N.A',
  CURVA = 'CURVA',
  RECTA = 'RECTA',
}

/**
 * Sentido de derivación del cambiavía.
 * Indica hacia qué lado se desvía la vía secundaria.
 */
export enum Derivacion {
  IZQUIERDA = 'IZQUIERDA',
  DERECHA = 'DERECHA',
}