import { http } from '../http';
import { UsuarioAutenticado } from '../types/common';

export const authApi = {
  obtenerUsuarioActual: async (): Promise<UsuarioAutenticado> => {
    const { data } = await http.get<UsuarioAutenticado>('/auth/me');
    return data;
  },
};