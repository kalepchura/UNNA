export interface Grafico2DesgasteFiltros {
  escenarioIds?: number[];
}

export interface Grafico2DesgasteSerie {
  codigo: string;
  nombre: string;
  datos: (number | null)[];
}

export interface Grafico2DesgasteResponse {
  configAplicada: Grafico2DesgasteFiltros;
  categorias: string[];
  series: Grafico2DesgasteSerie[];
  metadata: {
    totalEscenarios: number;
    calculadoEn: string;
  };
}