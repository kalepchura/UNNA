// frontend/src/features/fallas/types/grafico-3.types.ts

/**
 * ============================================================
 * G3 — Fallas por velocidad (barras)
 * ============================================================
 * Eje X: velocidades del catálogo (ascendente).
 * Eje Y: cantidad.
 * Sin avanzados.
 * ============================================================
 */

import type { TipoFallaFiltro } from '@/lib/types/enums/fallas.enum';
import type {
  NivelAnalisis,
  TipoViaFiltroFallas,
} from '@/lib/types/enums/fallas-graficos.enum';

export interface Grafico3Filtros {
  fechaDesde?: string;
  fechaHasta?: string;

  tipoVia?: TipoViaFiltroFallas;
  nivel?: NivelAnalisis;
  tipoFalla?: TipoFallaFiltro;
  elementoIds?: number[];

  /**
   * Si true, 2 series apiladas (Riel + Soldadura).
   * Solo aplica si AMBAS están incluidas; en otro caso se ignora.
   */
  apilarPorTipo?: boolean;
}

export interface Grafico3Serie {
  nombre: string;
  codigo: string;
  datos: number[];
}

export interface Grafico3Metadata {
  totalFallas: number;
  calculadoEn: Date;
  nivel?: NivelAnalisis;
  mensaje?: string;
}

export interface Grafico3Response {
  categorias: string[];
  series: Grafico3Serie[];
  metadata: Grafico3Metadata;
}