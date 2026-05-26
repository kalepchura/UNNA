/**
 * ============================================================
 * TIPOS DEL GRÁFICO 2 — Distribución por categoría
 * ============================================================
 * Espejo del backend en:
 *   backend/src/modules/fallas/dto/graficos/grafico-2/
 *
 * Filtros disponibles:
 *  - Temporales: fechaDesde, fechaHasta
 *  - Categóricos: tipoFalla, tipoVia, categoria (dimensión del gráfico)
 *  - Geográficos: tramoIds, curvaHorizontalIds, curvaVerticalIds
 *  - Caracterización (FASE 2.D, solo riel):
 *    tipoDefectos, elementosAfectados, zonasAfectadas, perfiles, estadosActuales
 *
 * categoria: define POR QUÉ campo agrupar (eje X del bar chart).
 * Ver enum CategoriaG2 para los valores disponibles y sus etiquetas.
 * ============================================================
 */

import type {
  TipoFallaFiltro,
  CategoriaG2,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  EstadoFalla,
} from '@/lib/types/enums/fallas.enum';

export interface Grafico2Filtros {
  /** Fecha en formato YYYY-MM-DD. */
  fechaDesde?: string;
  /** Fecha en formato YYYY-MM-DD. */
  fechaHasta?: string;

  tipoFalla?: TipoFallaFiltro;
  tipoVia?: string;

  /**
   * Dimensión por la que agrupar las barras.
   * Default backend: ACCION (soldadura).
   */
  categoria?: CategoriaG2;

  tramoIds?: number[];

  // ----- FASE 1 — Filtros de curva (solo aplican a fallas_riel) -----
  curvaHorizontalIds?: number[];
  curvaVerticalIds?: number[];

  // ----- FASE 2.D — Filtros por caracterización (solo aplican a fallas_riel) -----
  tipoDefectos?: TipoDefectoRiel[];
  elementosAfectados?: ElementoAfectadoRiel[];
  zonasAfectadas?: ZonaAfectadaRiel[];
  perfiles?: PerfilFallaRiel[];
  estadosActuales?: EstadoFalla[];
}

export interface Grafico2Barra {
  categoria: string;
  total: number;
}

export interface Grafico2Response {
  configAplicada: Grafico2Filtros;
  barras: Grafico2Barra[];
  metadata: {
    totalFallas: number;
    calculadoEn: Date;
  };
}