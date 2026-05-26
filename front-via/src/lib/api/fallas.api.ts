/**
 * ============================================================
 * FALLAS API
 * ============================================================
 * Cliente HTTP del módulo de fallas. Estructura:
 *
 *   fallasApi.riel.*        → CRUD + archivos de falla riel
 *   fallasApi.acciones.*    → Historial de intervenciones (FASE 2)
 *   fallasApi.soldadura.*   → CRUD + imágenes de falla soldadura
 *   fallasApi.analytics.*   → KPIs y gráficos (1, 2, 3)
 *
 * Espejo de los endpoints del backend en:
 *   backend/src/modules/fallas/controllers/
 * ============================================================
 */

import { http } from '../http';
import type { PaginatedResponse } from '@/lib/types/common';

// Tipos riel
import type {
  FallaRiel,
  CrearFallaRielDto,
  ActualizarFallaRielDto,
  FiltrosFallaRiel,
} from '@/features/fallas/types/falla-riel.types';

// Tipos acción riel (FASE 2)
import type {
  AccionRielResponse,
  CrearAccionRielDto,
  ActualizarAccionRielDto,
} from '@/features/fallas/types/accion-riel.types';

// Tipos soldadura
import type {
  FallaSoldaduraInox,
  CrearFallaSoldaduraDto,
  ActualizarFallaSoldaduraDto,
  FiltrosFallaSoldadura,
} from '@/features/fallas/types/falla-soldadura.types';

// Tipos imagen
import type {
  ImagenFalla,
  UrlImagenFalla,
} from '@/features/fallas/types/imagen-falla.types';

// Enum tipo archivo
import { TipoArchivoFalla } from '@/lib/types/common';

// Tipos analytics
import type {
  Grafico1Filtros,
  Grafico1Response,
} from '@/features/fallas/types/grafico-1.types';
import type {
  Grafico2Filtros,
  Grafico2Response,
} from '@/features/fallas/types/grafico-2.types';
import type {
  Grafico3Filtros,
  Grafico3Response,
} from '@/features/fallas/types/grafico-3.types';
import type { KpisFallasResponse } from '@/features/fallas/types/kpis-fallas.types';

// ============================================================
// TIPO DE ARCHIVO (helper)
// ============================================================

interface RespuestaSubirArchivo {
  nombreArchivo: string;
  rutaStorage: string;
}

interface RespuestaUrlArchivo {
  url: string;
  nombre: string;
}

// ============================================================
// FALLA RIEL
// ============================================================

const riel = {
  /** POST /fallas/riel/buscar — listado paginado con filtros. */
  buscar: async (
    filtros: FiltrosFallaRiel,
  ): Promise<PaginatedResponse<FallaRiel>> => {
    const { data } = await http.post<PaginatedResponse<FallaRiel>>(
      '/fallas/riel/buscar',
      filtros,
    );
    return data;
  },

  /**
   * GET /fallas/riel/:id
   * Devuelve la falla con el timeline de acciones (acciones array).
   */
  obtener: async (id: number): Promise<FallaRiel> => {
    const { data } = await http.get<FallaRiel>(`/fallas/riel/${id}`);
    return data;
  },

  /** POST /fallas/riel */
  crear: async (dto: CrearFallaRielDto): Promise<FallaRiel> => {
    const { data } = await http.post<FallaRiel>('/fallas/riel', dto);
    return data;
  },

  /** PATCH /fallas/riel/:id */
  actualizar: async (
    id: number,
    dto: ActualizarFallaRielDto,
  ): Promise<FallaRiel> => {
    const { data } = await http.patch<FallaRiel>(`/fallas/riel/${id}`, dto);
    return data;
  },

  /** DELETE /fallas/riel/:id (soft delete) */
  eliminar: async (id: number): Promise<void> => {
    await http.delete(`/fallas/riel/${id}`);
  },

  /** POST /fallas/riel/:id/restaurar (solo ADMIN) */
  restaurar: async (id: number): Promise<void> => {
    await http.post(`/fallas/riel/${id}/restaurar`);
  },

  /** POST /fallas/riel/eliminados (solo ADMIN) */
  listarEliminados: async (
    filtros: FiltrosFallaRiel,
  ): Promise<PaginatedResponse<FallaRiel>> => {
    const { data } = await http.post<PaginatedResponse<FallaRiel>>(
      '/fallas/riel/eliminados',
      filtros,
    );
    return data;
  },

  // ----- Archivos (interno/externo, máx 1 de cada) -----

  /**
   * POST /fallas/riel/:id/archivo/:tipo
   * Sube un archivo (interno o externo). Reemplaza el existente si lo hay.
   */
  subirArchivo: async (
    id: number,
    tipo: TipoArchivoFalla,
    archivo: File,
  ): Promise<RespuestaSubirArchivo> => {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const { data } = await http.post<RespuestaSubirArchivo>(
      `/fallas/riel/${id}/archivo/${tipo}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** DELETE /fallas/riel/:id/archivo/:tipo */
  eliminarArchivo: async (
    id: number,
    tipo: TipoArchivoFalla,
  ): Promise<void> => {
    await http.delete(`/fallas/riel/${id}/archivo/${tipo}`);
  },

  /** GET /fallas/riel/:id/archivo/:tipo/url (URL firmada temporal). */
  obtenerUrlArchivo: async (
    id: number,
    tipo: TipoArchivoFalla,
  ): Promise<RespuestaUrlArchivo> => {
    const { data } = await http.get<RespuestaUrlArchivo>(
      `/fallas/riel/${id}/archivo/${tipo}/url`,
    );
    return data;
  },
};

// ============================================================
// ACCIONES DE FALLA RIEL (FASE 2 — Historial de intervenciones)
// ============================================================

const acciones = {
  /**
   * GET /fallas/riel/:fallaId/acciones
   * Timeline cronológico (ascendente) de una falla.
   * Solo acciones activas (eliminadas excluidas).
   */
  listarPorFalla: async (
    fallaId: number,
  ): Promise<AccionRielResponse[]> => {
    const { data } = await http.get<AccionRielResponse[]>(
      `/fallas/riel/${fallaId}/acciones`,
    );
    return data;
  },

  /**
   * GET /fallas/riel/:fallaId/acciones/eliminadas (solo ADMIN)
   * Timeline incluyendo acciones eliminadas (página de auditoría).
   */
  listarConEliminadas: async (
    fallaId: number,
  ): Promise<AccionRielResponse[]> => {
    const { data } = await http.get<AccionRielResponse[]>(
      `/fallas/riel/${fallaId}/acciones/eliminadas`,
    );
    return data;
  },

  /**
   * POST /fallas/riel/:fallaId/acciones
   * Crea una acción nueva. El backend sincroniza estadoActual
   * de la falla padre automáticamente.
   */
  crear: async (
    fallaId: number,
    dto: CrearAccionRielDto,
  ): Promise<AccionRielResponse> => {
    const { data } = await http.post<AccionRielResponse>(
      `/fallas/riel/${fallaId}/acciones`,
      dto,
    );
    return data;
  },

  /** GET /fallas/riel/acciones/:id */
  obtener: async (id: number): Promise<AccionRielResponse> => {
    const { data } = await http.get<AccionRielResponse>(
      `/fallas/riel/acciones/${id}`,
    );
    return data;
  },

  /**
   * PATCH /fallas/riel/acciones/:id
   * Edita una acción. Sincroniza estadoActual de la falla padre.
   */
  actualizar: async (
    id: number,
    dto: ActualizarAccionRielDto,
  ): Promise<AccionRielResponse> => {
    const { data } = await http.patch<AccionRielResponse>(
      `/fallas/riel/acciones/${id}`,
      dto,
    );
    return data;
  },

  /**
   * DELETE /fallas/riel/acciones/:id (soft delete)
   * Si era la acción más reciente, el estado de la falla padre
   * se recalcula automáticamente.
   */
  eliminar: async (id: number): Promise<void> => {
    await http.delete(`/fallas/riel/acciones/${id}`);
  },

  /** POST /fallas/riel/acciones/:id/restaurar (solo ADMIN) */
  restaurar: async (id: number): Promise<void> => {
    await http.post(`/fallas/riel/acciones/${id}/restaurar`);
  },
};

// ============================================================
// FALLA SOLDADURA INOX
// ============================================================

const soldadura = {
  buscar: async (
    filtros: FiltrosFallaSoldadura,
  ): Promise<PaginatedResponse<FallaSoldaduraInox>> => {
    const { data } = await http.post<PaginatedResponse<FallaSoldaduraInox>>(
      '/fallas/soldadura-inox/buscar',
      filtros,
    );
    return data;
  },

  obtener: async (id: number): Promise<FallaSoldaduraInox> => {
    const { data } = await http.get<FallaSoldaduraInox>(
      `/fallas/soldadura-inox/${id}`,
    );
    return data;
  },

  crear: async (
    dto: CrearFallaSoldaduraDto,
  ): Promise<FallaSoldaduraInox> => {
    const { data } = await http.post<FallaSoldaduraInox>(
      '/fallas/soldadura-inox',
      dto,
    );
    return data;
  },

  actualizar: async (
    id: number,
    dto: ActualizarFallaSoldaduraDto,
  ): Promise<FallaSoldaduraInox> => {
    const { data } = await http.patch<FallaSoldaduraInox>(
      `/fallas/soldadura-inox/${id}`,
      dto,
    );
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await http.delete(`/fallas/soldadura-inox/${id}`);
  },

  restaurar: async (id: number): Promise<void> => {
    await http.post(`/fallas/soldadura-inox/${id}/restaurar`);
  },

  listarEliminados: async (
    filtros: FiltrosFallaSoldadura,
  ): Promise<PaginatedResponse<FallaSoldaduraInox>> => {
    const { data } = await http.post<PaginatedResponse<FallaSoldaduraInox>>(
      '/fallas/soldadura-inox/eliminados',
      filtros,
    );
    return data;
  },

  // ----- Imágenes (múltiples por falla) -----

  /** GET /fallas/soldadura-inox/:id/imagenes */
  listarImagenes: async (fallaId: number): Promise<ImagenFalla[]> => {
    const { data } = await http.get<ImagenFalla[]>(
      `/fallas/soldadura-inox/${fallaId}/imagenes`,
    );
    return data;
  },

  /** POST /fallas/soldadura-inox/:id/imagenes (multipart). */
  subirImagen: async (
    fallaId: number,
    archivo: File,
  ): Promise<ImagenFalla> => {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const { data } = await http.post<ImagenFalla>(
      `/fallas/soldadura-inox/${fallaId}/imagenes`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** DELETE /fallas/soldadura-inox/imagenes/:imagenId */
  eliminarImagen: async (imagenId: number): Promise<void> => {
    await http.delete(`/fallas/soldadura-inox/imagenes/${imagenId}`);
  },

  /** GET /fallas/soldadura-inox/imagenes/:imagenId/url */
  obtenerUrlImagen: async (imagenId: number): Promise<UrlImagenFalla> => {
    const { data } = await http.get<UrlImagenFalla>(
      `/fallas/soldadura-inox/imagenes/${imagenId}/url`,
    );
    return data;
  },
};

// ============================================================
// ANALYTICS (KPIs + Gráficos)
// ============================================================

const analytics = {
  /** GET /fallas/kpis */
  kpis: async (): Promise<KpisFallasResponse> => {
    const { data } = await http.get<KpisFallasResponse>('/fallas/kpis');
    return data;
  },

  /** POST /fallas/graficos/1 */
  grafico1: async (config: Grafico1Filtros): Promise<Grafico1Response> => {
    const { data } = await http.post<Grafico1Response>(
      '/fallas/graficos/1',
      { config },
    );
    return data;
  },

  /** POST /fallas/graficos/2 */
  grafico2: async (config: Grafico2Filtros): Promise<Grafico2Response> => {
    const { data } = await http.post<Grafico2Response>(
      '/fallas/graficos/2',
      { config },
    );
    return data;
  },

  /** POST /fallas/graficos/3 */
  grafico3: async (config: Grafico3Filtros): Promise<Grafico3Response> => {
    const { data } = await http.post<Grafico3Response>(
      '/fallas/graficos/3',
      { config },
    );
    return data;
  },
};

// ============================================================
// EXPORT FINAL
// ============================================================

/**
 * API agrupada del módulo fallas.
 *
 * Uso:
 *   import { fallasApi } from '@/lib/api/fallas.api';
 *
 *   const lista = await fallasApi.riel.buscar({ page: 1 });
 *   await fallasApi.riel.crear({ progresiva: 100, via: 'PAR', ... });
 *   await fallasApi.riel.subirArchivo(1, TipoArchivoFalla.INTERNO, file);
 *
 *   // FASE 2 — Acciones
 *   const timeline = await fallasApi.acciones.listarPorFalla(1);
 *   await fallasApi.acciones.crear(1, { accion: 'ESMERILADO', conclusion: 'PROGRAMADO' });
 *
 *   const sold = await fallasApi.soldadura.buscar({});
 *   const imgs = await fallasApi.soldadura.listarImagenes(1);
 *
 *   const kpis = await fallasApi.analytics.kpis();
 */
export const fallasApi = {
  riel,
  acciones,
  soldadura,
  analytics,
};