// backend/src/modules/fallas/helpers/graficos.helper.ts

/**
 * ============================================================
 * HELPER COMPARTIDO DE GRÁFICOS DE FALLAS
 * ============================================================
 * Centraliza:
 *  1. Validación de config (campos obligatorios + combinaciones válidas).
 *  2. Resolución del nivel → columna SQL en cada tabla.
 *  3. Normalización del filtro de vía → string|null para la query.
 * ============================================================
 */

import {
  NivelAnalisis,
  TipoViaFiltroFallas,
  VIAS_VALIDAS_POR_NIVEL,
} from '../enums/fallas-graficos.enums';
import { TipoFallaFiltro } from '../../../common/enums';

/**
 * Resultado de validar una config:
 *  - ok=true  → puede ejecutarse contra BD.
 *  - ok=false → devolver gráfico vacío con `mensaje` en metadata.
 */
export type ResultadoValidacion =
  | { ok: true }
  | { ok: false; mensaje: string };

/**
 * Forma mínima que cualquier config de gráfico DEBE tener para
 * que el helper la valide. Cada DTO específico extiende esta forma.
 */
export interface ConfigBaseGrafico {
  nivel?: NivelAnalisis;
  tipoVia?: TipoViaFiltroFallas;
  tipoFalla?: TipoFallaFiltro;
  elementoIds?: number[];
}

/**
 * Valida lo que debe estar presente para que el gráfico tenga
 * sentido. No revisa rango temporal (cada gráfico tiene el suyo).
 *
 * NO usa defaults. Si falta algo → devuelve mensaje claro.
 */
export function validarConfigBase(config: ConfigBaseGrafico): ResultadoValidacion {
  if (!config.nivel) {
    return { ok: false, mensaje: 'Selecciona un nivel de análisis (Tramo, Curva H, Curva V o Cambiavía).' };
  }

  if (!config.elementoIds || config.elementoIds.length === 0) {
    return { ok: false, mensaje: 'Selecciona al menos un elemento del nivel elegido.' };
  }

  // Validación nivel + vía
  const via = config.tipoVia ?? TipoViaFiltroFallas.TODAS;
  const viasValidas = VIAS_VALIDAS_POR_NIVEL[config.nivel];
  if (!viasValidas.includes(via)) {
    return {
      ok: false,
      mensaje: `La vía "${via}" no aplica al nivel "${config.nivel}". Vías válidas: ${viasValidas.join(', ')}.`,
    };
  }

  // Nivel = CAMBIAVIA → tipoFalla debe ser SOLDADURA o no venir.
  // Si viene RIEL, es combinación absurda → mensaje claro.
  if (
    config.nivel === NivelAnalisis.CAMBIAVIA &&
    config.tipoFalla === TipoFallaFiltro.RIEL
  ) {
    return {
      ok: false,
      mensaje: 'El nivel "Cambiavía" no aplica a fallas de Riel (solo Soldadura).',
    };
  }

  return { ok: true };
}

/**
 * Resuelve qué tipo de falla efectivamente se debe consultar,
 * forzando SOLDADURA cuando el nivel es CAMBIAVIA.
 *
 * Para el resto de niveles, si no viene tipoFalla, se asume "ambas".
 */
export function resolverTipoFalla(
  nivel: NivelAnalisis,
  tipoFalla?: TipoFallaFiltro,
): { incluirRiel: boolean; incluirSoldadura: boolean } {
  // Cambiavía → solo soldadura, sin importar lo que mandó el cliente.
  if (nivel === NivelAnalisis.CAMBIAVIA) {
    return { incluirRiel: false, incluirSoldadura: true };
  }

  const tf = tipoFalla ?? TipoFallaFiltro.AMBAS;
  return {
    incluirRiel: tf === TipoFallaFiltro.RIEL || tf === TipoFallaFiltro.AMBAS,
    incluirSoldadura: tf === TipoFallaFiltro.SOLDADURA || tf === TipoFallaFiltro.AMBAS,
  };
}

/**
 * Devuelve el string para el filtro WHERE de vía (o null si "TODAS").
 * La query usa `($N::text IS NULL OR <col> = $N)` para que `null` no filtre.
 */
export function resolverViaFiltro(tipoVia?: TipoViaFiltroFallas): string | null {
  if (!tipoVia || tipoVia === TipoViaFiltroFallas.TODAS) return null;
  return tipoVia;
}

/**
 * Traducción nivel → columnas en cada tabla.
 *
 * En riel, las columnas son directas.
 * En soldadura, todas las geográficas vienen del cambiavía (cv.*).
 *
 * NULL en riel = ese nivel NO aplica a la tabla de riel
 * (caso: nivel=CAMBIAVIA → riel no participa).
 */
export interface ColumnasPorNivel {
  /** Columna en fallas_riel (alias 'f'). NULL si riel no aplica a este nivel. */
  columnaRiel: string | null;
  /** Columna en cambiavias (alias 'cv') usada por soldadura. */
  columnaSoldadura: string;
  /** Tabla del catálogo para hacer JOIN con el id (tramos, curvas_horizontales, etc). */
  tablaCatalogo: string;
  /** Columna de "nombre legible" para la leyenda del gráfico. */
  columnaNombreCatalogo: string;
  /** Columna de "código corto" (cuando exista; si no, repite el nombre). */
  columnaCodigoCatalogo: string;
}

export function columnasPorNivel(nivel: NivelAnalisis): ColumnasPorNivel {
  switch (nivel) {
    case NivelAnalisis.TRAMO:
      return {
        columnaRiel: 'f.tramo_id',
        columnaSoldadura: 'cv.tramo_id',
        tablaCatalogo: 'tramos',
        columnaNombreCatalogo: 'nombre',
        columnaCodigoCatalogo: 'codigo',
      };
    case NivelAnalisis.CURVA_H:
      return {
        columnaRiel: 'f.curva_horizontal_id',
        columnaSoldadura: 'cv.curva_horizontal_id',
        tablaCatalogo: 'curvas_horizontales',
        columnaNombreCatalogo: 'nombre',
        columnaCodigoCatalogo: 'nombre',
      };
    case NivelAnalisis.CURVA_V:
      return {
        columnaRiel: 'f.curva_vertical_id',
        columnaSoldadura: 'cv.curva_vertical_id',
        tablaCatalogo: 'curvas_verticales',
        columnaNombreCatalogo: 'nombre',
        columnaCodigoCatalogo: 'nombre',
      };
    case NivelAnalisis.CAMBIAVIA:
      return {
        // Riel NO tiene cambiavía → se marca NULL para que el SQL lo omita.
        columnaRiel: null,
        columnaSoldadura: 'f.cambiavia_id',
        tablaCatalogo: 'cambiavias',
        columnaNombreCatalogo: 'codigo_bd',
        columnaCodigoCatalogo: 'codigo_bd',
      };
  }
}