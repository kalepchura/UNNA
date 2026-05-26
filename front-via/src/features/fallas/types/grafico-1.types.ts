/**
 * ============================================================
 * TIPOS DEL GRÁFICO 1 — Evolución temporal
 * ============================================================
 * Espejo del backend en:
 *   backend/src/modules/fallas/dto/graficos/grafico-1/
 *
 * Filtros disponibles:
 *  - Temporales: granularidad, anio, anioInicio, anioFin
 *  - Categóricos: tipoFalla, tipoVia
 *  - Geográficos: tramoIds, curvaHorizontalIds, curvaVerticalIds (multi-select)
 *  - Caracterización (FASE 2.D, solo riel):
 *    tipoDefectos, elementosAfectados, zonasAfectadas, perfiles, estadosActuales
 * ============================================================
 */

import type {
  GranularidadTemporal,
  TipoFallaFiltro,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  EstadoFalla,
} from '@/lib/types/enums/fallas.enum';

/**
 * Filtros del Gráfico 1.
 * Todos los campos son opcionales. Si no se envía nada, el
 * backend aplica defaults (granularidad mensual, año actual, etc.).
 *
 * tipoVia se mantiene como string libre porque el backend usa
 * TipoViaFiltro (PAR|IMPAR|AMBAS) que es un enum distinto al
 * TipoVia (PAR|IMPAR|TERCERA|CERO). Para no acoplar, usamos string.
 */
export interface Grafico1Filtros {
  granularidad?: GranularidadTemporal;
  anio?: number;
  anioInicio?: number;
  anioFin?: number;
  tipoFalla?: TipoFallaFiltro;
  tipoVia?: string;
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

export interface Grafico1Serie {
  nombre: string;
  codigo: string;
  datos: number[];
}

export interface Grafico1Response {
  configAplicada: Grafico1Filtros;
  categorias: string[];
  series: Grafico1Serie[];
  metadata: {
    totalFallas: number;
    calculadoEn: Date;
  };
}