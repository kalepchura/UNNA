import { http } from '../http';
import { UsuarioAutenticado } from '../types/common';

export const authApi = {
  obtenerUsuarioActual: async (token?: string): Promise<UsuarioAutenticado> => {
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const { data } = await http.get<UsuarioAutenticado>('/auth/me', config);
    return data;
  },
};