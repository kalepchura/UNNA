// Esquema base
export interface TramoEsquema {
  codigo: string;
  nombre: string;
  progresivaInicio: number;
  progresivaFin: number;
}

export interface EstacionEsquema {
  codigo: string;
  nombre: string;
  progresiva: number;
}

export interface EsquemaBaseResponse {
  progresivaMinima: number;
  progresivaMaxima: number;
  tramos: TramoEsquema[];
  estaciones: EstacionEsquema[];
  totalTramos: number;
  totalEstaciones: number;
  generadoEn: string;
}

// Temperatura
export interface MapaTemperaturaFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoValor?: 'PROMEDIO' | 'MAXIMO';
}

export interface TramoColoreadoTemperatura {
  codigo: string;
  nombre: string;
  progresivaInicio: number;
  progresivaFin: number;
  valor: number | null;
  color: 'VERDE' | 'AMARILLO' | 'ROJO' | 'GRIS';
  cantidadMediciones: number;
}

export interface MapaTemperaturaResponse {
  filtrosAplicados: MapaTemperaturaFiltros;
  tramos: TramoColoreadoTemperatura[];
  metadata: {
    totalTramos: number;
    tramosConDatos: number;
    tramosSinDatos: number;
    calculadoEn: string;
  };
}

// Desgaste General
export interface MapaDesgasteGeneralFiltros {
  escenarioId?: number;
  puntoW?: 'W1' | 'W2' | 'W3R' | 'W3L';
  fechaCorte?: string;
}

export interface PuntoColoreadoDesgaste {
  codigoElemento: number;
  progresiva: number;
  valorMm: number | null;
  color: 'VERDE' | 'AMARILLO' | 'ROJO' | 'GRIS';
  anio: number | null;
  trimestre: number | null;
}

export interface LineaDesgaste {
  via: string;
  riel: string;
  etiqueta: string;
  puntos: PuntoColoreadoDesgaste[];
}

export interface MapaDesgasteGeneralResponse {
  filtrosAplicados: {
    escenarioId: number;
    puntoW: string;
    fechaCorte: string;
  };
  lineas: LineaDesgaste[];
  metadata: {
    totalElementos: number;
    elementosConDatos: number;
    elementosSinDatos: number;
    calculadoEn: string;
  };
}

// Desgaste Índice
export interface MapaDesgasteIndiceFiltros {
  escenarioIdA?: number;
  puntoWA?: 'W1' | 'W2' | 'W3R' | 'W3L';
  escenarioIdB?: number;
  puntoWB?: 'W1' | 'W2' | 'W3R' | 'W3L';
  fechaCorte?: string;
}

export interface PuntoColoreadoIndice {
  codigoElemento: number;
  progresiva: number;
  valorA: number | null;
  valorB: number | null;
  indice: number | null;
  color: 'VERDE' | 'AMARILLO' | 'ROJO' | 'GRIS';
  anioA: number | null;
  trimestreA: number | null;
  anioB: number | null;
  trimestreB: number | null;
}

export interface LineaDesgasteIndice {
  via: string;
  riel: string;
  etiqueta: string;
  puntos: PuntoColoreadoIndice[];
}

export interface MapaDesgasteIndiceResponse {
  filtrosAplicados: {
    escenarioIdA: number;
    puntoWA: string;
    escenarioIdB: number;
    puntoWB: string;
    fechaCorte: string;
  };
  lineas: LineaDesgasteIndice[];
  metadata: {
    totalElementos: number;
    elementosConIndice: number;
    elementosSinDatos: number;
    calculadoEn: string;
  };
}

// Fallas
export type SegmentacionFallas = 'TRAMO' | 'CAMBIAVIA' | 'CURVA_HORIZONTAL' | 'CURVA_VERTICAL';

export interface MapaFallasFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  segmentacion?: SegmentacionFallas;
}

export interface ElementoColoreadoFallas {
  codigo: string;
  nombre: string;
  progresivaInicio: number;
  progresivaFin: number;
  cantidadFallas: number;
  color: 'VERDE' | 'AMARILLO' | 'ROJO' | 'GRIS';
}

export interface LineaFallas {
  via: string;
  etiqueta: string;
  elementos: ElementoColoreadoFallas[];
}

export interface MapaFallasResponse {
  filtrosAplicados: {
    fechaDesde: string;
    fechaHasta: string;
    segmentacion: SegmentacionFallas;
  };
  lineas: LineaFallas[];
  metadata: {
    totalElementos: number;
    elementosConFallas: number;
    elementosSinFallas: number;
    calculadoEn: string;
  };
}