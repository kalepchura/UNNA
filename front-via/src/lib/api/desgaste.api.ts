import { http } from '../http';
import type { PaginatedResponse } from '@/lib/types/common';

// Analytics
import type { KpisDesgasteResponse } from '@/features/desgaste/types/kpis-desgaste.types';
import type { Grafico1DesgasteFiltros, Grafico1DesgasteResponse } from '@/features/desgaste/types/grafico-1.types';
import type { Grafico2DesgasteFiltros, Grafico2DesgasteResponse } from '@/features/desgaste/types/grafico-2.types';
import type { Grafico3DesgasteFiltros, Grafico3DesgasteResponse } from '@/features/desgaste/types/grafico-3.types';

// Escenarios
import type {
  FiltrosEscenarios,
  EscenarioResponse,
  CrearEscenarioDto,
  ActualizarEscenarioDto,
} from '@/features/desgaste/types/escenarios.types';

// Valores MTB
import type {
  ValoresMtbResponse,
  GuardarValoresMtbRequest,
  GuardarValoresMtbResponse,
} from '@/features/desgaste/types/valores-mtb.types';

// Mediciones
import type {
  CargarGrillaFiltros,
  GrillaResponse,
  GuardarCambiosRequest,
  GuardarCambiosResponse,
} from '@/features/desgaste/types/mediciones.types';

// ─── WIZARD ─────────────────────────────────────────────────
const wizard = {
  obtenerOpciones: async (request: any) => {
    const { data } = await http.post('/desgaste/wizard-filtros', request);
    return data;
  },
};

// ─── ESCENARIOS ─────────────────────────────────────────────
const escenarios = {
  /** POST /desgaste/escenarios/buscar */
  buscar: async (filtros: FiltrosEscenarios): Promise<PaginatedResponse<EscenarioResponse>> => {
    const { data } = await http.post<PaginatedResponse<EscenarioResponse>>(
      '/desgaste/escenarios/buscar',
      filtros,
    );
    return data;
  },

  /** GET /desgaste/escenarios/:id */
  obtener: async (id: number): Promise<EscenarioResponse> => {
    const { data } = await http.get<EscenarioResponse>(`/desgaste/escenarios/${id}`);
    return data;
  },

  /** POST /desgaste/escenarios */
  crear: async (dto: CrearEscenarioDto): Promise<EscenarioResponse> => {
    const { data } = await http.post<EscenarioResponse>('/desgaste/escenarios', dto);
    return data;
  },

  /** PATCH /desgaste/escenarios/:id */
  actualizar: async (id: number, dto: ActualizarEscenarioDto): Promise<EscenarioResponse> => {
    const { data } = await http.patch<EscenarioResponse>(`/desgaste/escenarios/${id}`, dto);
    return data;
  },

  /** DELETE /desgaste/escenarios/:id */
  eliminar: async (id: number): Promise<void> => {
    await http.delete(`/desgaste/escenarios/${id}`);
  },

  /** POST /desgaste/escenarios/:id/restaurar */
  restaurar: async (id: number): Promise<void> => {
    await http.post(`/desgaste/escenarios/${id}/restaurar`);
  },

  /** POST /desgaste/escenarios/eliminados */
  listarEliminados: async (filtros: FiltrosEscenarios): Promise<PaginatedResponse<EscenarioResponse>> => {
    const { data } = await http.post<PaginatedResponse<EscenarioResponse>>(
      '/desgaste/escenarios/eliminados',
      filtros,
    );
    return data;
  },

  /** GET /desgaste/escenarios/:id/valores */
  listarValores: async (id: number): Promise<ValoresMtbResponse> => {
    const { data } = await http.get<ValoresMtbResponse>(`/desgaste/escenarios/${id}/valores`);
    return data;
  },

  /** POST /desgaste/escenarios/:id/valores/guardar */
  guardarValores: async (id: number, dto: GuardarValoresMtbRequest): Promise<GuardarValoresMtbResponse> => {
    const { data } = await http.post<GuardarValoresMtbResponse>(
      `/desgaste/escenarios/${id}/valores/guardar`,
      dto,
    );
    return data;
  },
};

// ─── MEDICIONES ─────────────────────────────────────────────
const mediciones = {
  /** POST /desgaste/mediciones/grilla */
  cargarGrilla: async (filtros: CargarGrillaFiltros): Promise<GrillaResponse> => {
    const { data } = await http.post<GrillaResponse>('/desgaste/mediciones/grilla', filtros);
    return data;
  },

  /** POST /desgaste/mediciones/guardar */
  guardarCambios: async (dto: GuardarCambiosRequest): Promise<GuardarCambiosResponse> => {
    const { data } = await http.post<GuardarCambiosResponse>('/desgaste/mediciones/guardar', dto);
    return data;
  },
};

// ─── ANALYTICS ──────────────────────────────────────────────
const analytics = {
  kpis: async (): Promise<KpisDesgasteResponse> => {
    const { data } = await http.get<KpisDesgasteResponse>('/desgaste/kpis');
    return data;
  },
  grafico1: async (config: Grafico1DesgasteFiltros): Promise<Grafico1DesgasteResponse> => {
    const { data } = await http.post<Grafico1DesgasteResponse>('/desgaste/graficos/1', { config });
    return data;
  },
  grafico2: async (config: Grafico2DesgasteFiltros): Promise<Grafico2DesgasteResponse> => {
    const { data } = await http.post<Grafico2DesgasteResponse>('/desgaste/graficos/2', { config });
    return data;
  },
  grafico3: async (config: Grafico3DesgasteFiltros): Promise<Grafico3DesgasteResponse> => {
    const { data } = await http.post<Grafico3DesgasteResponse>('/desgaste/graficos/3', { config });
    return data;
  },
};

export const desgasteApi = {
  wizard,
  escenarios,
  mediciones,
  analytics,
};