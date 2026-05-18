export interface Grafico1TempFiltros {
  granularidad?: 'DIARIA' | 'MENSUAL' | 'ANUAL';
  anio?: number;
  anioInicio?: number;
  anioFin?: number;
  tramoIds?: number[];
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string;
}

export interface Grafico1TempValores {
  min: (number | null)[];
  avg: (number | null)[];
  max: (number | null)[];
}

export interface Grafico1TempSerie {
  codigo: string;
  nombre: string;
  valores: Grafico1TempValores;
}

export interface Grafico1TempResponse {
  configAplicada: Grafico1TempFiltros;
  categorias: string[];
  series: Grafico1TempSerie[];
  metadata: {
    totalRegistros: number;
    calculadoEn: string;
  };
}