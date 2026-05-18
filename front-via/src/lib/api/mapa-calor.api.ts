import { http } from '../http';
import type {
  EsquemaBaseResponse,
  MapaTemperaturaFiltros,
  MapaTemperaturaResponse,
  MapaDesgasteGeneralFiltros,
  MapaDesgasteGeneralResponse,
  MapaDesgasteIndiceFiltros,
  MapaDesgasteIndiceResponse,
  MapaFallasFiltros,
  MapaFallasResponse,
} from '@/features/mapa-calor/types/mapa-calor.types';

export const mapaCalorApi = {
  esquemaBase: async (): Promise<EsquemaBaseResponse> => {
    const { data } = await http.get<EsquemaBaseResponse>('/mapa-calor/esquema-base');
    return data;
  },
  temperatura: async (filtros: MapaTemperaturaFiltros): Promise<MapaTemperaturaResponse> => {
    const { data } = await http.post<MapaTemperaturaResponse>('/mapa-calor/temperatura', filtros);
    return data;
  },
  desgasteGeneral: async (filtros: MapaDesgasteGeneralFiltros): Promise<MapaDesgasteGeneralResponse> => {
    const { data } = await http.post<MapaDesgasteGeneralResponse>('/mapa-calor/desgaste/general', filtros);
    return data;
  },
  desgasteIndice: async (filtros: MapaDesgasteIndiceFiltros): Promise<MapaDesgasteIndiceResponse> => {
    const { data } = await http.post<MapaDesgasteIndiceResponse>('/mapa-calor/desgaste/indice', filtros);
    return data;
  },
  fallas: async (filtros: MapaFallasFiltros): Promise<MapaFallasResponse> => {
    const { data } = await http.post<MapaFallasResponse>('/mapa-calor/fallas', filtros);
    return data;
  },
};