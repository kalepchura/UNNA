import { http } from '../http';
import {
  TipoVia,
  LadoRiel,
  PerfilRiel,
  CarrilCurva,
} from '../types/common';


/**
 * ============================================================
 * CATALOGOS — los 7 catálogos del backend (todos read-only)
 * ============================================================
 * Endpoints:
 *  - GET /api/v1/{catalogo}            → listar (devuelve objeto paginado: { data: [], total, ... })
 *  - GET /api/v1/{catalogo}/:id        → detalle
 *  - GET /api/v1/{catalogo}/filtro     → versión simplificada para selects (devuelve array directo)
 * ============================================================
 */

// ----- TIPOS -----

export interface Tramo {
  id: number;
  codigo: string;
  nombre: string;
  progresivaInicio: number;
  progresivaFin: number;
  orden: number;
}

export interface TramoFiltro {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Estacion {
  id: number;
  codigo: string;
  nombre: string;
  progresiva: number;
  tramoId: number;
  orden: number;
  tramoCodigo?: string;   // ← viene del backend con JOIN
}

// Actualizar la interfaz CambiaviaQ
export interface Cambiavia {
  id: number;
  codigoBd: string;
  descripcion?: string | null;
  tipo?: string;
  norma?: string;
  via: TipoVia;
  derivacion?: string;
  agujaTipo?: string;
  progresiva: number;
  tramoId: number;
  curvaHorizontalId?: number | null;
  curvaVerticalId?: number | null;
  velocidadKmh?: number;
}

// Actualizar CurvaHorizontal
export interface CurvaHorizontal {
  id: number;
  nombre: string;
  via: string;
  radio: number | null;
  inicioM: number;
  finM: number;
  peralte: number | null;
  estacionInicioId: number | null;
  estacionFinId: number | null;
}

// Actualizar CurvaVertical
export interface CurvaVertical {
  id: number;
  nombre: string;
  via: string;
  inicioM: number;
  finM: number;
  pkVertice: number | null;
  pendienteEntrada: number | null;
  pendienteSalida: number | null;
  radio: number | null;
}




export interface Velocidad {
  id: number;
  progresivaInicio: number;
  progresivaFin: number;
  velocidadKmh: number;
}


// catalogos.api.ts
export interface ElementoDesgaste {
  id: number;
  codigoElemento: number;
  progresiva: number;
  via: TipoVia;
  tramoId: number;
  curvaHorizontalId: number | null;
  curvaVerticalId: number | null;
  riel: LadoRiel;
  perfil: PerfilRiel;
  carrilCurva: CarrilCurva;
}

/**
 * Opción simplificada de un catálogo (devuelta por endpoints `/filtro`).
 * El backend usa esto para alimentar dropdowns en el frontend.
 */
export interface OpcionCatalogo {
  codigo: string;
  etiqueta: string;
  id?: number;
}

// ----- Tipos para respuesta paginada -----
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
// ----- API -----

export const catalogosApi = {
  tramos: {
    // ✅ Para la TABLA
    listarParaTabla: async (params?: { limit?: number }): Promise<Tramo[]> => {
      const { data } = await http.get<Tramo[]>('/tramos/tabla', { params });
      return data;
    },
    
    // ✅ Para el SELECTOR
    listarParaSelector: async (): Promise<{ id: number; codigo: string }[]> => {
      const { data } = await http.get('/tramos/selector');
      return data;
    },
    
    // ✅ Para DETALLE
    obtenerPorId: async (id: number): Promise<Tramo> => {
      const { data } = await http.get<Tramo>(`/tramos/${id}`);
      return data;
    },
  },

  // ----- Estaciones -----
  estaciones: {
    // ✅ Para la TABLA
    listarParaTabla: async (params?: { limit?: number }): Promise<Estacion[]> => {
      const { data } = await http.get<Estacion[]>('/estaciones/tabla', { params });
      return data;
    },
    
    // ✅ Para el SELECTOR
    listarParaSelector: async (): Promise<{ id: number; codigo: string; nombre: string }[]> => {
      const { data } = await http.get('/estaciones/selector');
      return data;
    },
    
    // ✅ Para DETALLE
    obtenerPorId: async (id: number): Promise<Estacion> => {
      const { data } = await http.get<Estacion>(`/estaciones/${id}`);
      return data;
    },
  },

  // ----- Curvas Horizontales -----
  curvasHorizontales: {

    listarParaTabla: async (params?: { limit?: number }): Promise<CurvaHorizontal[]> => {
      const { data } = await http.get<CurvaHorizontal[]>('/curvas-horizontales/tabla', { params });
      return data;
    },

    listarParaSelector: async (): Promise<{ id: number; nombre: string; via: string }[]> => {
      const { data } = await http.get('/curvas-horizontales/selector');
      return data;
    },
    
    obtenerPorId: async (id: number): Promise<CurvaHorizontal> => {
      const { data } = await http.get<CurvaHorizontal>(`/curvas-horizontales/${id}`);
      return data;
    },
  },

  // ----- Curvas Verticales -----
  curvasVerticales: {

    listarParaTabla: async (params?: { limit?: number }): Promise<CurvaVertical[]> => {
      const { data } = await http.get<CurvaVertical[]>('/curvas-verticales/tabla', { params });
      return data;
    },
    

    listarParaSelector: async (): Promise<{ id: number; nombre: string; via: string }[]> => {
      const { data } = await http.get('/curvas-verticales/selector');
      return data;
    },
    

    obtenerPorId: async (id: number): Promise<CurvaVertical> => {
      const { data } = await http.get<CurvaVertical>(`/curvas-verticales/${id}`);
      return data;
    },
  },

  // ----- Velocidades -----
  velocidades: {
    // ✅ Para la TABLA
    listarParaTabla: async (params?: { limit?: number }): Promise<Velocidad[]> => {
      const { data } = await http.get<Velocidad[]>('/velocidades/tabla', { params });
      return data;
    },
    
    // ✅ Para DETALLE
    obtenerPorId: async (id: number): Promise<Velocidad> => {
      const { data } = await http.get<Velocidad>(`/velocidades/${id}`);
      return data;
    },
    
    // ✅ Para FILTRO (valores únicos de velocidad en km/h)
    paraFiltro: async (): Promise<number[]> => {
      const { data } = await http.get<number[]>('/velocidades/filtro');
      return data;
    },
  },

  // ----- Cambiavías -----
  cambiavias: {
    // ✅ Para la TABLA (todos los campos, una sola llamada)
    listarParaTabla: async (params?: { limit?: number }): Promise<Cambiavia[]> => {
      const { data } = await http.get<Cambiavia[]>('/cambiavias/tabla', { params });
      return data;
    },
    
    // ✅ Para el SELECTOR (solo id y codigoBd)
    listarParaSelector: async (): Promise<{ id: number; codigoBd: string }[]> => {
      const { data } = await http.get('/cambiavias/selector');
      return data;
    },
    
    // ✅ Para DETALLE
    obtenerPorId: async (id: number): Promise<Cambiavia> => {
      const { data } = await http.get<Cambiavia>(`/cambiavias/${id}`);
      return data;
    },
  },

  // ----- Elementos Desgaste -----
  elementosDesgaste: {

    listarParaTabla: async (params?: { limit?: number }): Promise<ElementoDesgaste[]> => {
      const { data } = await http.get<ElementoDesgaste[]>('/elementos-desgaste/tabla', { params });
      return data;
    },
    
    listarParaSelector: async (): Promise<{ id: number; codigoElemento: number }[]> => {
      const { data } = await http.get('/elementos-desgaste/selector');
      return data;
    },
    
    obtenerPorId: async (id: number): Promise<ElementoDesgaste> => {
      const { data } = await http.get<ElementoDesgaste>(`/elementos-desgaste/${id}`);
      return data;
    },
  },
};