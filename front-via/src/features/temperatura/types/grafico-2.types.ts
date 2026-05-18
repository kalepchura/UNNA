export interface Grafico2TempFiltros {
  tramoIds?: number[];
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface Grafico2TempBarra {
  codigo: string;
  nombre: string;
  min: number | null;
  avg: number | null;
  max: number | null;
  cantidadRegistros: number;
}

export interface Grafico2TempResponse {
  configAplicada: Grafico2TempFiltros;
  barras: Grafico2TempBarra[];
  metadata: {
    totalRegistros: number;
    calculadoEn: string;
  };
}