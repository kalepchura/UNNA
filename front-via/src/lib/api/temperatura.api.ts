import { http } from '../http';
import type { PaginatedResponse } from '@/lib/types/common';

import type { KpisTemperaturaResponse } from '@/features/temperatura/types/kpis-temperatura.types';
import type { Grafico1TempFiltros, Grafico1TempResponse } from '@/features/temperatura/types/grafico-1.types';
import type { Grafico2TempFiltros, Grafico2TempResponse } from '@/features/temperatura/types/grafico-2.types';
import type { Grafico3TempFiltros, Grafico3TempResponse } from '@/features/temperatura/types/grafico-3.types';

import type {
  FiltrosImportaciones,
  ImportacionResponse,
  TemperaturaRegistroResponse,
  ImportarTemperaturaDto,
  ImportacionResultado,
  FiltrosRegistros,
} from '@/features/temperatura/types/importacion-types';

// Helper para limpiar el centinela 'todos' antes de enviar al backend
function limpiarFiltros(filtros: FiltrosImportaciones): Record<string, unknown> {
  const { tipoArchivo, ...resto } = filtros;
  return {
    ...resto,
    // ✅ Solo incluir tipoArchivo si tiene valor real (no undefined, no 'todos')
    ...(tipoArchivo ? { tipoArchivo } : {}),
  };
}

// ─── IMPORTACIONES ──────────────────────────────────────────
const importaciones = {
  /** POST /temperatura/importaciones/buscar */
  buscar: async (filtros: FiltrosImportaciones): Promise<PaginatedResponse<ImportacionResponse>> => {
    const { data } = await http.post<PaginatedResponse<ImportacionResponse>>(
      '/temperatura/importaciones/buscar',
      limpiarFiltros(filtros),
    );
    return data;
  },

  /** GET /temperatura/importaciones/:id */
  obtener: async (id: number): Promise<ImportacionResponse> => {
    const { data } = await http.get<ImportacionResponse>(`/temperatura/importaciones/${id}`);
    return data;
  },

  /** POST /temperatura/importaciones/:id/registros */
  listarRegistros: async (
    id: number,
    filtros: FiltrosRegistros,
  ): Promise<PaginatedResponse<TemperaturaRegistroResponse>> => {
    const { data } = await http.post<PaginatedResponse<TemperaturaRegistroResponse>>(
      `/temperatura/importaciones/${id}/registros`,
      filtros,
    );
    return data;
  },

  /** GET /temperatura/importaciones/:id/archivo/url */
  obtenerUrlArchivo: async (id: number): Promise<{ url: string; nombre: string }> => {
    const { data } = await http.get<{ url: string; nombre: string }>(
      `/temperatura/importaciones/${id}/archivo/url`,
    );
    return data;
  },

  /** POST /temperatura/importaciones (multipart) */
  importar: async (archivo: File, dto: ImportarTemperaturaDto): Promise<ImportacionResultado> => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('progresiva', String(dto.progresiva));
    if (dto.comentarioEspecialista) {
      formData.append('comentarioEspecialista', dto.comentarioEspecialista);
    }
    const { data } = await http.post<ImportacionResultado>(
      '/temperatura/importaciones',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** DELETE /temperatura/importaciones/:id */
  eliminar: async (id: number): Promise<void> => {
    await http.delete(`/temperatura/importaciones/${id}`);
  },

  /** POST /temperatura/importaciones/:id/restaurar */
  restaurar: async (id: number): Promise<void> => {
    await http.post(`/temperatura/importaciones/${id}/restaurar`);
  },

  /** POST /temperatura/importaciones/eliminados */
  listarEliminadas: async (filtros: FiltrosImportaciones): Promise<PaginatedResponse<ImportacionResponse>> => {
    const { data } = await http.post<PaginatedResponse<ImportacionResponse>>(
      '/temperatura/importaciones/eliminados',
      limpiarFiltros(filtros),
    );
    return data;
  },
};

// ─── ANALYTICS ──────────────────────────────────────────────
const analytics = {
  kpis: async (): Promise<KpisTemperaturaResponse> => {
    const { data } = await http.get<KpisTemperaturaResponse>('/temperatura/kpis');
    return data;
  },
  grafico1: async (config: Grafico1TempFiltros): Promise<Grafico1TempResponse> => {
    const { data } = await http.post<Grafico1TempResponse>('/temperatura/graficos/1', { config });
    return data;
  },
  grafico2: async (config: Grafico2TempFiltros): Promise<Grafico2TempResponse> => {
    const { data } = await http.post<Grafico2TempResponse>('/temperatura/graficos/2', { config });
    return data;
  },
  grafico3: async (config: Grafico3TempFiltros): Promise<Grafico3TempResponse> => {
    const { data } = await http.post<Grafico3TempResponse>('/temperatura/graficos/3', { config });
    return data;
  },
};

export const temperaturaApi = {
  importaciones,
  analytics,
};