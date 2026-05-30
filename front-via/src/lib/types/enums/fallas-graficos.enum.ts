// frontend/src/lib/types/enums/fallas-graficos.enum.ts

/**
 * ============================================================
 * ENUMS DE GRÁFICOS DE FALLAS
 * ============================================================
 * Espejo exacto del backend en:
 *   backend/src/modules/fallas/enums/fallas-graficos.enums.ts
 *
 * Estos enums son LOCALES al módulo fallas. No confundir con
 * `TipoViaFiltro` antiguo (sigue existiendo en geograficos.enum.ts
 * para no romper temperatura/desgaste).
 *
 * ESTRUCTURA:
 *  1. Enums (contrato técnico — viajan al backend).
 *  2. LABEL_* (textos legibles para UI).
 *  3. Reglas de combinación (VIAS_VALIDAS_POR_NIVEL).
 * ============================================================
 */

// ============================================================
// ENUMS
// ============================================================

/**
 * Nivel de análisis del gráfico.
 * Define cómo se agrupan las fallas:
 *
 *  - TRAMO      : una línea/barra por tramo.
 *  - CURVA_H    : una línea/barra por curva horizontal.
 *  - CURVA_V    : una línea/barra por curva vertical.
 *  - CAMBIAVIA  : una línea/barra por cambiavía. SOLO soldaduras
 *                 (riel no tiene cambiavía).
 */
export enum NivelAnalisis {
  TRAMO = 'TRAMO',
  CURVA_H = 'CURVA_H',
  CURVA_V = 'CURVA_V',
  CAMBIAVIA = 'CAMBIAVIA',
}

/**
 * Filtro de vía para gráficos de fallas. 5 opciones.
 *
 *  - PAR, IMPAR     : aplican a TODOS los niveles.
 *  - CERO, TERCERA  : SOLO aplican al nivel CAMBIAVIA.
 *  - TODAS          : no filtra por vía.
 */
export enum TipoViaFiltroFallas {
  PAR = 'PAR',
  IMPAR = 'IMPAR',
  CERO = 'CERO',
  TERCERA = 'TERCERA',
  TODAS = 'TODAS',
}

/**
 * Modo de visualización del Gráfico 2.
 *  - CATEGORIA: eje X = opciones del enum (categoría).
 *  - ELEMENTO : eje X = elementos del nivel, barras apiladas por enum.
 */
export enum ModoG2 {
  CATEGORIA = 'CATEGORIA',
  ELEMENTO = 'ELEMENTO',
}

// ============================================================
// LABELS PARA UI
// ============================================================

export const LABEL_NIVEL: Record<NivelAnalisis, string> = {
  [NivelAnalisis.TRAMO]: 'Tramo',
  [NivelAnalisis.CURVA_H]: 'Curva Horizontal',
  [NivelAnalisis.CURVA_V]: 'Curva Vertical',
  [NivelAnalisis.CAMBIAVIA]: 'Cambiavía',
};

export const LABEL_VIA_FALLAS: Record<TipoViaFiltroFallas, string> = {
  [TipoViaFiltroFallas.PAR]: 'Vía Par',
  [TipoViaFiltroFallas.IMPAR]: 'Vía Impar',
  [TipoViaFiltroFallas.CERO]: 'Vía Cero',
  [TipoViaFiltroFallas.TERCERA]: 'Vía Tercera',
  [TipoViaFiltroFallas.TODAS]: 'Todas las vías',
};

export const LABEL_MODO_G2: Record<ModoG2, string> = {
  [ModoG2.CATEGORIA]: 'Por categoría',
  [ModoG2.ELEMENTO]: 'Por elemento (apilado)',
};

// ============================================================
// REGLAS DE COMBINACIÓN (espejo del backend)
// ============================================================

/**
 * Qué vías son válidas para cada nivel.
 * El front filtra el selector de vía según el nivel actual,
 * y el backend valida defensivamente con la misma regla.
 */
export const VIAS_VALIDAS_POR_NIVEL: Record<NivelAnalisis, TipoViaFiltroFallas[]> = {
  [NivelAnalisis.TRAMO]:     [TipoViaFiltroFallas.PAR, TipoViaFiltroFallas.IMPAR, TipoViaFiltroFallas.TODAS],
  [NivelAnalisis.CURVA_H]:   [TipoViaFiltroFallas.PAR, TipoViaFiltroFallas.IMPAR, TipoViaFiltroFallas.TODAS],
  [NivelAnalisis.CURVA_V]:   [TipoViaFiltroFallas.PAR, TipoViaFiltroFallas.IMPAR, TipoViaFiltroFallas.TODAS],
  [NivelAnalisis.CAMBIAVIA]: [
    TipoViaFiltroFallas.PAR,
    TipoViaFiltroFallas.IMPAR,
    TipoViaFiltroFallas.CERO,
    TipoViaFiltroFallas.TERCERA,
    TipoViaFiltroFallas.TODAS,
  ],
};

/**
 * Indica si en el nivel actual tiene sentido elegir "tipo de falla".
 * Si nivel = CAMBIAVIA, no hay elección posible (solo soldadura).
 */
export function nivelPermiteTipoFalla(nivel: NivelAnalisis | undefined): boolean {
  return nivel !== NivelAnalisis.CAMBIAVIA;
}