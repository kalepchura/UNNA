import { http } from '../http';
import type { PaginatedResponse } from '@/lib/types/common';
import type {
  Usuario,
  FiltrosUsuarios,
  CrearUsuarioDto,
  ActualizarUsuarioDto,
} from '@/features/usuarios/types/usuarios.types';

export const usuariosApi = {
  /** GET /usuarios */
  listar: async (
    filtros: FiltrosUsuarios,
  ): Promise<PaginatedResponse<Usuario>> => {
    const { data } = await http.get<PaginatedResponse<Usuario>>('/usuarios', {
      params: filtros,
    });
    return data;
  },

  /** GET /usuarios/:id */
  obtener: async (id: string): Promise<Usuario> => {
    const { data } = await http.get<Usuario>(`/usuarios/${id}`);
    return data;
  },

  /** POST /usuarios */
  crear: async (dto: CrearUsuarioDto): Promise<Usuario> => {
    const { data } = await http.post<Usuario>('/usuarios', dto);
    return data;
  },

  /** PATCH /usuarios/:id */
  actualizar: async (
    id: string,
    dto: ActualizarUsuarioDto,
  ): Promise<Usuario> => {
    const { data } = await http.patch<Usuario>(`/usuarios/${id}`, dto);
    return data;
  },

  /** DELETE /usuarios/:id */
  desactivar: async (id: string): Promise<void> => {
    await http.delete(`/usuarios/${id}`);
  },

  /** POST /usuarios/:id/reset-password */
  resetPassword: async (id: string): Promise<void> => {
    await http.post(`/usuarios/${id}/reset-password`);
  },
};