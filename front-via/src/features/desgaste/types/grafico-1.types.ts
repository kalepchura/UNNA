export interface Grafico1DesgasteFiltros {
  tipoAgrupacion?: 'TRAMO' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL';
  tramoId?: number;
  curvaHorizontalId?: number;
  curvaVerticalId?: number;
  via?: 'AMBAS' | 'PAR' | 'IMPAR';
  elementoCodigos?: number[];
  puntosW?: ('W1' | 'W2' | 'W3R' | 'W3L')[];
}

export interface Grafico1DesgastePunto {
  x: number;
  y: number;
  anio: number;
}

export interface Grafico1DesgasteSerie {
  codigo: string;
  nombre: string;
  codigoElemento: number;
  punto: 'W1' | 'W2' | 'W3R' | 'W3L';
  puntos: Grafico1DesgastePunto[];
}

export interface Grafico1DesgasteResponse {
  configAplicada: Grafico1DesgasteFiltros;
  series: Grafico1DesgasteSerie[];
  metadata: {
    totalLineas: number;
    totalMediciones: number;
    toleranciaMm: number;
    calculadoEn: string;
  };
}