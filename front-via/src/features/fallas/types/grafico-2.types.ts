// frontend/src/features/fallas/types/grafico-2.types.ts


export interface Grafico2Filtros {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoFalla?: string;
  tipoVia?: string;
  categoria?: string;
  tramoIds?: number[];
}

export interface Grafico2Barra {
  categoria: string;
  total: number;
}

export interface Grafico2Response {
  configAplicada: Grafico2Filtros;
  barras: Grafico2Barra[];
  metadata: {
    totalFallas: number;
    calculadoEn: Date;
  };
}
