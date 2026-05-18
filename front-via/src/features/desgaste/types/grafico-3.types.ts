export interface Grafico3DesgasteFiltros {
  tipoAgrupacion?: 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL';
  tramoId?: number;
  curvaHorizontalId?: number;
  curvaVerticalId?: number;
  via?: 'AMBAS' | 'PAR' | 'IMPAR';
  elementoCodigos?: number[];
  puntosW?: ('W1' | 'W2' | 'W3R' | 'W3L')[];
  escenarioId?: number;
}

export interface Grafico3DesgastePunto {
  x: number;
  y: number;
  anio: number;
}

export interface Grafico3DesgasteSerie {
  codigo: string;
  nombre: string;
  codigoElemento: number;
  punto: 'W1' | 'W2' | 'W3R' | 'W3L';
  escenarioCodigo: string;
  puntos: Grafico3DesgastePunto[];
}

export interface Grafico3DesgasteResponse {
  configAplicada: Grafico3DesgasteFiltros;
  series: Grafico3DesgasteSerie[];
  metadata: {
    escenarioNombre: string;
    totalLineas: number;
    totalMediciones: number;
    toleranciaMm: number;
    calculadoEn: string;
  };
}