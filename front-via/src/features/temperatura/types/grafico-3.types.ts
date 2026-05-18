export interface Grafico3TempFiltros {
  tramoIds?: number[];
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface Grafico3TempValores {
  min: (number | null)[];
  avg: (number | null)[];
  max: (number | null)[];
}

export interface Grafico3TempSerie {
  codigo: string;
  nombre: string;
  valores: Grafico3TempValores;
}

export interface Grafico3TempResponse {
  configAplicada: Grafico3TempFiltros;
  categorias: string[]; // 24 horas fijas: ["00:00", "01:00", ...]
  series: Grafico3TempSerie[];
  metadata: {
    totalRegistros: number;
    calculadoEn: string;
  };
}