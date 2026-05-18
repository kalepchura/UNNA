
export interface Grafico3Filtros {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoFalla?: string;
  tipoVia?: string;
  apilarPorTipo?: boolean;
  tramoIds?: number[];
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