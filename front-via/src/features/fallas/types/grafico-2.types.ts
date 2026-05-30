// frontend/src/features/fallas/types/grafico-2.types.ts

/**
 * ============================================================
 * G2 — Distribución por categoría (barras)
 * ============================================================
 * Eje Y = cantidad siempre.
 *
 * Dos modos:
 *  - CATEGORIA (default): eje X = opciones del enum. 1 serie "Total".
 *  - ELEMENTO          : eje X = elementos. N series apiladas por enum.
 *
 * Tiene avanzados como acotadores opcionales (vacío = no acota).
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
  AccionFalla,
  UbicacionFalla,
} from '@/lib/types/enums/fallas.enum';
import type {
  NivelAnalisis,
  TipoViaFiltroFallas,
  ModoG2,
} from '@/lib/types/enums/fallas-graficos.enum';

export interface Grafico2Filtros {
  // Temporal
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string; // YYYY-MM-DD

  // Principales
  tipoVia?: TipoViaFiltroFallas;
  nivel?: NivelAnalisis;
  tipoFalla?: TipoFallaFiltro;
  elementoIds?: number[];

  // Categoría y modo
  categoria?: CategoriaG2;
  modo?: ModoG2;

  // Avanzados RIEL
  tipoDefectos?: TipoDefectoRiel[];
  elementosAfectados?: ElementoAfectadoRiel[];
  zonasAfectadas?: ZonaAfectadaRiel[];
  perfiles?: PerfilFallaRiel[];
  estadosActuales?: EstadoFalla[];

  // Avanzados SOLDADURA
  acciones?: AccionFalla[];
  ubicacionesFalla?: UbicacionFalla[];
}

export interface Grafico2Serie {
  nombre: string;
  codigo: string;
  datos: number[];
}

export interface Grafico2Metadata {
  totalFallas: number;
  calculadoEn: Date;
  nivel?: NivelAnalisis;
  modo?: ModoG2;
  mensaje?: string;
}

export interface Grafico2Response {
  /**
   * Etiquetas del eje X.
   *  - modo CATEGORIA: opciones del enum.
   *  - modo ELEMENTO : nombres de los elementos seleccionados.
   */
  categorias: string[];
  series: Grafico2Serie[];
  metadata: Grafico2Metadata;
}