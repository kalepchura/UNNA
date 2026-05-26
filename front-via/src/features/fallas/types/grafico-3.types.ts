/**
 * ============================================================
 * TIPOS DEL GRÁFICO 3 — Fallas por velocidad
 * ============================================================
 * Espejo del backend en:
 *   backend/src/modules/fallas/dto/graficos/grafico-3/
 *
 * Filtros disponibles:
 *  - Temporales: fechaDesde, fechaHasta
 *  - Categóricos: tipoFalla, tipoVia, apilarPorTipo
 *  - Geográficos: tramoIds, curvaHorizontalIds, curvaVerticalIds
 *  - Caracterización (FASE 2.D, solo riel):
 *    tipoDefectos, elementosAfectados, zonasAfectadas, perfiles, estadosActuales
 *
 * apilarPorTipo:
 *  - false (default): 1 serie "Total"
 *  - true: 2 series apiladas "Riel" + "Soldadura"
 * ============================================================
 */

import type {
  TipoFallaFiltro,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  EstadoFalla,
} from '@/lib/types/enums/fallas.enum';

export interface Grafico3Filtros {
  /** Fecha en formato YYYY-MM-DD. */
  fechaDesde?: string;
  /** Fecha en formato YYYY-MM-DD. */
  fechaHasta?: string;

  tipoFalla?: TipoFallaFiltro;
  tipoVia?: string;

  /**
   * Si true, devuelve 2 series apiladas (Riel + Soldadura).
   * Si false, devuelve 1 serie "Total".
   */
  apilarPorTipo?: boolean;

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

export interface Grafico3Serie {
  nombre: string;
  codigo: string;
  datos: number[];
}

export interface Grafico3Response {
  configAplicada: Grafico3Filtros;
  categorias: string[];
  series: Grafico3Serie[];
  metadata: {
    totalFallas: number;
    calculadoEn: Date;
  };
}