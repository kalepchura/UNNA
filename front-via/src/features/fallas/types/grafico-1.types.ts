// frontend/src/features/fallas/types/grafico-1.types.ts

/**
 * ============================================================
 * G1 — Evolución temporal (líneas)
 * ============================================================
 * Espejo del backend en:
 *   backend/src/modules/fallas/dto/graficos/grafico-1/
 *
 * Filtros:
 *  - Temporales: granularidad + (anio) o (anioInicio, anioFin)
 *  - tipoVia (filtro de vía, 5 opciones)
 *  - nivel (Tramo / Curva H / Curva V / Cambiavía)
 *  - tipoFalla (opcional, ignorado si nivel=CAMBIAVIA)
 *  - elementoIds: ids de los elementos del nivel elegido (≥1)
 *
 * NO tiene avanzados (esos solo G2 los usa).
 * ============================================================
 */

import type {
  GranularidadTemporal,
  TipoFallaFiltro,
} from '@/lib/types/enums/fallas.enum';
import type {
  NivelAnalisis,
  TipoViaFiltroFallas,
} from '@/lib/types/enums/fallas-graficos.enum';

export interface Grafico1Filtros {
  granularidad?: GranularidadTemporal;
  anio?: number;
  anioInicio?: number;
  anioFin?: number;

  tipoVia?: TipoViaFiltroFallas;
  nivel?: NivelAnalisis;
  tipoFalla?: TipoFallaFiltro;

  /**
   * IDs del nivel elegido. Vacío = no se grafica nada.
   *  - nivel=TRAMO      → ids de tramos
   *  - nivel=CURVA_H    → ids de curvas horizontales
   *  - nivel=CURVA_V    → ids de curvas verticales
   *  - nivel=CAMBIAVIA  → ids de cambiavías
   */
  elementoIds?: number[];
}

export interface Grafico1Serie {
  nombre: string;
  codigo: string;
  elementoId: number;
  datos: number[];
}

export interface Grafico1Metadata {
  totalFallas: number;
  calculadoEn: Date;
  nivel?: NivelAnalisis;
  /** Si el backend rechazó la config, viene un mensaje aquí. */
  mensaje?: string;
}

export interface Grafico1Response {
  categorias: string[];
  series: Grafico1Serie[];
  metadata: Grafico1Metadata;
}