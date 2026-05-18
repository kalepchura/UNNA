/**
 * ============================================================
 * ENUMS DEL MÓDULO DESGASTE
 * ============================================================
 * Enums específicos del módulo de desgaste de rieles.
 *
 * Espejo exacto del backend en:
 *   src/common/enums/index.ts (sección "MÓDULO DESGASTE")
 * ============================================================
 */

/**
 * Punto de medición de desgaste en el riel.
 *
 * Cada punto W representa una zona específica del perfil del riel
 * donde se mide el desgaste con instrumentos especializados.
 *
 * - W1: punto de medición 1
 * - W2: punto de medición 2
 * - W3R: punto de medición 3, lado derecho (Right)
 * - W3L: punto de medición 3, lado izquierdo (Left)
 *
 * Usado como filtro multi-select en los gráficos G1 y G3 del
 * módulo Desgaste.
 */
export enum PuntoW {
  W1 = 'W1',
  W2 = 'W2',
  W3R = 'W3R',
  W3L = 'W3L',
}

/**
 * Tipo de agrupación espacial para el wizard de filtros de Desgaste.
 *
 * Define el primer nivel del filtro en cascada usado en los
 * gráficos G1 y G3.
 *
 * - TRAMO: agrupar mediciones por tramo de vía
 * - CURVA_HORIZONTAL: agrupar por curva horizontal
 * - CURVA_VERTICAL: agrupar por curva vertical
 */
export enum TipoAgrupacionDesgaste {
  TRAMO = 'TRAMO',
  CURVA_HORIZONTAL = 'CURVA_HORIZONTAL',
  CURVA_VERTICAL = 'CURVA_VERTICAL',
}