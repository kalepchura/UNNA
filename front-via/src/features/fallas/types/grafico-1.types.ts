

export interface Grafico1Filtros {
  granularidad?: 'MENSUAL' | 'ANUAL';  
  anio?: number;                        
  anioInicio?: number;                  
  anioFin?: number;                     
  tipoFalla?: string;                   
  tipoVia?: string;                     
  tramoIds?: number[];                  
}

export interface Grafico1Serie {
  nombre: string;
  codigo: string;
  datos: number[];
}

export interface Grafico1Response {
  configAplicada: Grafico1Filtros;
  categorias: string[];
  series: Grafico1Serie[];
  metadata: {
    totalFallas: number;
    calculadoEn: Date;
  };
}