import { http } from '../http';
import type { PaginatedResponse } from '@/lib/types/common';
import type {
  FiltrarAuditoriaFiltros,
  AuditoriaLogResponse,
  EliminadosResumenResponse,
} from '@/features/auditoria/types/auditoria.types';

export const auditoriaApi = {
  /** GET /auditoria */
  listar: async (
    filtros: FiltrarAuditoriaFiltros,
  ): Promise<PaginatedResponse<AuditoriaLogResponse>> => {
    const { data } = await http.get<PaginatedResponse<AuditoriaLogResponse>>(
      '/auditoria',
      { params: filtros },
    );
    return data;
  },

  /** GET /auditoria/eliminados/resumen */
  obtenerResumenEliminados: async (): Promise<EliminadosResumenResponse> => {
    const { data } = await http.get<EliminadosResumenResponse>(
      '/auditoria/eliminados/resumen',
    );
    return data;
  },
};