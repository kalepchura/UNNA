// backend/src/modules/fallas/enums/fallas-graficos.enums.ts

/**
 * ============================================================
 * ENUMS PROPIOS DEL MÓDULO FALLAS (gráficos)
 * ============================================================
 * Estos enums son LOCALES al módulo fallas. No se exportan a
 * `common/enums/index.ts` para no romper temperatura ni desgaste,
 * que siguen usando el `TipoViaFiltro` antiguo (PAR/IMPAR/AMBAS).
 *
 * Cuando migres temperatura y desgaste a este patrón, replicas
 * la misma idea allí (un enum por módulo) o promueves estos a
 * common/enums. Por ahora se quedan acá.
 * ============================================================
 */

/**
 * Nivel de análisis del gráfico.
 * Define cómo se agrupan las fallas y qué tabla manda.
 *
 *  - TRAMO     : agrupar por tramo_id.        Aplica a riel y soldadura.
 *  - CURVA_H   : agrupar por curva_horizontal_id. Riel y soldadura (vía cambiavía).
 *  - CURVA_V   : agrupar por curva_vertical_id.   Riel y soldadura (vía cambiavía).
 *  - CAMBIAVIA : agrupar por cambiavia_id.    Solo soldadura (riel no tiene cambiavía).
 */
export enum NivelAnalisis {
  TRAMO = 'TRAMO',
  CURVA_H = 'CURVA_H',
  CURVA_V = 'CURVA_V',
  CAMBIAVIA = 'CAMBIAVIA',
}

/**
 * Filtro de vía para gráficos de FALLAS.
 *
 * Reemplaza al antiguo TipoViaFiltro (que tenía solo PAR/IMPAR/AMBAS).
 * Ahora hay 5 opciones porque los cambiavías SÍ existen en vías CERO y TERCERA.
 *
 *  - PAR, IMPAR     : aplican a todos los niveles.
 *  - CERO, TERCERA  : SOLO aplican al nivel CAMBIAVIA.
 *                     Si el usuario las elige con otro nivel, el service
 *                     devuelve gráfico vacío con mensaje (no rompe nada).
 *  - TODAS          : no filtrar por vía (equivalente al antiguo AMBAS).
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
 *  - CATEGORIA: eje X = opciones del enum (categoría), una barra por opción.
 *  - ELEMENTO : eje X = elementos del nivel, barras apiladas por opción del enum.
 */
export enum ModoG2 {
  CATEGORIA = 'CATEGORIA',
  ELEMENTO = 'ELEMENTO',
}

/**
 * Qué vías son válidas para cada nivel.
 *
 * Whitelist explícita. Si llega una combinación que no está aquí,
 * el service la rechaza con un mensaje claro (sin tocar la BD).
 */
export const VIAS_VALIDAS_POR_NIVEL: Record<NivelAnalisis, TipoViaFiltroFallas[]> = {
  [NivelAnalisis.TRAMO]:   [TipoViaFiltroFallas.PAR, TipoViaFiltroFallas.IMPAR, TipoViaFiltroFallas.TODAS],
  [NivelAnalisis.CURVA_H]: [TipoViaFiltroFallas.PAR, TipoViaFiltroFallas.IMPAR, TipoViaFiltroFallas.TODAS],
  [NivelAnalisis.CURVA_V]: [TipoViaFiltroFallas.PAR, TipoViaFiltroFallas.IMPAR, TipoViaFiltroFallas.TODAS],
  [NivelAnalisis.CAMBIAVIA]: [
    TipoViaFiltroFallas.PAR,
    TipoViaFiltroFallas.IMPAR,
    TipoViaFiltroFallas.CERO,
    TipoViaFiltroFallas.TERCERA,
    TipoViaFiltroFallas.TODAS,
  ],
};