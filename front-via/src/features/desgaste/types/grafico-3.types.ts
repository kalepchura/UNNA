// ─── Config de una agrupación (un "bloque" del wizard) ──────────────────────

export interface Grafico3DesgasteConfig {
  tipoAgrupacion?: 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL';
  // Múltiples ids por agrupación
  tramoIds?: number[];
  curvaHorizontalIds?: number[];
  curvaVerticalIds?: number[];
  via?: 'AMBAS' | 'PAR' | 'IMPAR';
  elementoCodigos?: number[];
  puntosW?: ('W1' | 'W2' | 'W3R' | 'W3L')[];
  escenarioIds?: number[];
}

// ─── Request al backend ──────────────────────────────────────────────────────

export interface Grafico3DesgasteRequest {
  /** Lista de configuraciones independientes. Cada una genera sus propias líneas. */
  configuraciones?: Grafico3DesgasteConfig[];
}

// ─── Respuesta del backend ───────────────────────────────────────────────────

export interface Grafico3DesgastePunto {
  /** MTB acumulado del escenario en ese año (eje X). */
  x: number;
  /** Desgaste medido en mm (eje Y). Puede ser negativo. */
  y: number;
  /** Año de la medición (para tooltip). */
  anio: number;
  /** Trimestre del dato (último del año, para tooltip). */
  trimestre: number;
}

export interface Grafico3DesgasteSerie {
  /** ID único: "ELEM-{codigo}-{via}-{riel}-{puntoW}-ESC-{escenarioId}" */
  id: string;
  /** Etiqueta legible: "Elem. {codigo} · {via} · {riel} · {puntoW} · {escenarioNombre}" */
  nombre: string;
  codigoElemento: number;
  via: string;
  riel: string;
  punto: 'W1' | 'W2' | 'W3R' | 'W3L';
  escenarioId: number;
  escenarioNombre: string;
  /** Índice de la config que generó esta serie (0-based). */
  configIndex: number;
  puntos: Grafico3DesgastePunto[];
}

export interface Grafico3EscenarioInfo {
  id: number;
  nombre: string;
  /** MTB acumulado máximo (útil para escala del eje X). */
  mtbMaximo: number;
  anioInicio: number;
  anioFin: number;
}

export interface Grafico3DesgasteResponse {
  configuracionesAplicadas: Grafico3DesgasteConfig[];
  series: Grafico3DesgasteSerie[];
  metadata: {
    escenarios: Grafico3EscenarioInfo[];
    totalLineas: number;
    totalMediciones: number;
    toleranciaMm: number;
    /** Índices de configs que no generaron ninguna línea. */
    configsSinDatos: number[];
    calculadoEn: string;
  };
}

// ─── Tipo interno del wizard (estado de un bloque de configuración) ──────────

export interface WizardG3Block {
  /** ID local para React key, no va al backend. */
  _id: string;
  tipoAgrupacion: 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL';
  agrupacionIds: number[];
  via: 'AMBAS' | 'PAR' | 'IMPAR';
  elementoCodigos: number[];
  puntosW: ('W1' | 'W2' | 'W3R' | 'W3L')[];
  escenarioIds: number[];
  /** Paso actual del wizard de este bloque (1-6). */
  paso: number;
}