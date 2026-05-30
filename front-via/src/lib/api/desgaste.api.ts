import { http } from '../http';
import type { PaginatedResponse } from '@/lib/types/common';

// Analytics
import type { KpisDesgasteResponse } from '@/features/desgaste/types/kpis-desgaste.types';
import type { Grafico2DesgasteFiltros, Grafico2DesgasteResponse } from '@/features/desgaste/types/grafico-2.types';
import type {
  Grafico3DesgasteRequest,
  Grafico3DesgasteResponse,
} from '@/features/desgaste/types/grafico-3.types';

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

// ─── WIZARD ─────────────────────────────────────────────────────────────────

const wizard = {
  obtenerOpciones: async (request: {
    paso: number;
    tipoAgrupacion?: string;
    /** Singular — retrocompatibilidad G1 */
    agrupacionId?: number;
    /** Plural — G3 con multi-selección */
    agrupacionIds?: number[];
    via?: string;
  }) => {
    const { data } = await http.post('/desgaste/wizard-filtros', request);
    return data;
  },
};

// ─── ESCENARIOS ─────────────────────────────────────────────────────────────

const escenarios = {
  buscar: async (filtros: FiltrosEscenarios): Promise<PaginatedResponse<EscenarioResponse>> => {
    const { data } = await http.post<PaginatedResponse<EscenarioResponse>>(
      '/desgaste/escenarios/buscar',
      filtros,
    );
    return data;
  },

  obtener: async (id: number): Promise<EscenarioResponse> => {
    const { data } = await http.get<EscenarioResponse>(`/desgaste/escenarios/${id}`);
    return data;
  },

  crear: async (dto: CrearEscenarioDto): Promise<EscenarioResponse> => {
    const { data } = await http.post<EscenarioResponse>('/desgaste/escenarios', dto);
    return data;
  },

  actualizar: async (id: number, dto: ActualizarEscenarioDto): Promise<EscenarioResponse> => {
    const { data } = await http.patch<EscenarioResponse>(`/desgaste/escenarios/${id}`, dto);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await http.delete(`/desgaste/escenarios/${id}`);
  },

  restaurar: async (id: number): Promise<void> => {
    await http.post(`/desgaste/escenarios/${id}/restaurar`);
  },

  listarEliminados: async (filtros: FiltrosEscenarios): Promise<PaginatedResponse<EscenarioResponse>> => {
    const { data } = await http.post<PaginatedResponse<EscenarioResponse>>(
      '/desgaste/escenarios/eliminados',
      filtros,
    );
    return data;
  },

  listarValores: async (id: number): Promise<ValoresMtbResponse> => {
    const { data } = await http.get<ValoresMtbResponse>(`/desgaste/escenarios/${id}/valores`);
    return data;
  },

  guardarValores: async (
    id: number,
    dto: GuardarValoresMtbRequest,
  ): Promise<GuardarValoresMtbResponse> => {
    const { data } = await http.post<GuardarValoresMtbResponse>(
      `/desgaste/escenarios/${id}/valores/guardar`,
      dto,
    );
    return data;
  },
};

// ─── MEDICIONES ─────────────────────────────────────────────────────────────

const mediciones = {
  cargarGrilla: async (filtros: CargarGrillaFiltros): Promise<GrillaResponse> => {
    const { data } = await http.post<GrillaResponse>('/desgaste/mediciones/grilla', filtros);
    return data;
  },

  guardarCambios: async (dto: GuardarCambiosRequest): Promise<GuardarCambiosResponse> => {
    const { data } = await http.post<GuardarCambiosResponse>('/desgaste/mediciones/guardar', dto);
    return data;
  },
};

// ─── ANALYTICS ──────────────────────────────────────────────────────────────

const analytics = {
  kpis: async (): Promise<KpisDesgasteResponse> => {
    const { data } = await http.get<KpisDesgasteResponse>('/desgaste/kpis');
    return data;
  },

  grafico2: async (config: Grafico2DesgasteFiltros): Promise<Grafico2DesgasteResponse> => {
    const { data } = await http.post<Grafico2DesgasteResponse>('/desgaste/graficos/2', { config });
    return data;
  },

  /**
   * Gráfico 3 — Proyección de Desgaste por Escenario.
   *
   * Absorbe el anterior G1 (escenario REAL) y permite comparar
   * múltiples configuraciones y escenarios en una sola vista.
   *
   * Para replicar el comportamiento del antiguo G1, pasar una
   * configuración con escenarioIds: [ID_ESCENARIO_REAL].
   */
  grafico3: async (request: Grafico3DesgasteRequest): Promise<Grafico3DesgasteResponse> => {
    const { data } = await http.post<Grafico3DesgasteResponse>(
      '/desgaste/graficos/3',
      request,
    );
    return data;
  },
};

export const desgasteApi = {
  wizard,
  escenarios,
  mediciones,
  analytics,
};