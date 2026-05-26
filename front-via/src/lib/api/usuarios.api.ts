import { http } from '../http';

import type { PaginatedResponse } from '@/lib/types/common';

import type {
  Usuario,
  FiltrosUsuarios,
  CrearUsuarioDto,
  ActualizarUsuarioDto,
} from '@/features/usuarios/types/usuarios.types';

export const usuariosApi = {
  // ==========================================================
  // LISTAR
  // ==========================================================

  /** GET /usuarios */
  listar: async (
    filtros: FiltrosUsuarios,
  ): Promise<PaginatedResponse<Usuario>> => {
    const { data } =
      await http.get<PaginatedResponse<Usuario>>(
        '/usuarios',
        {
          params: filtros,
        },
      );

    return data;
  },

  // ==========================================================
  // OBTENER
  // ==========================================================

  /** GET /usuarios/:id */
  obtener: async (
    id: string,
  ): Promise<Usuario> => {
    const { data } =
      await http.get<Usuario>(
        `/usuarios/${id}`,
      );

    return data;
  },

  // ==========================================================
  // CREAR
  // ==========================================================

  /** POST /usuarios */
  crear: async (
    dto: CrearUsuarioDto,
  ): Promise<Usuario> => {
    const { data } =
      await http.post<Usuario>(
        '/usuarios',
        dto,
      );

    return data;
  },

  // ==========================================================
  // ACTUALIZAR
  // ==========================================================

  /** PATCH /usuarios/:id */
  actualizar: async (
    id: string,
    dto: ActualizarUsuarioDto,
  ): Promise<Usuario> => {
    const { data } =
      await http.patch<Usuario>(
        `/usuarios/${id}`,
        dto,
      );

    return data;
  },

  // ==========================================================
  // DESACTIVAR
  // ==========================================================

  /** DELETE /usuarios/:id */
  desactivar: async (
    id: string,
  ): Promise<void> => {
    await http.delete(
      `/usuarios/${id}`,
    );
  },

  // ==========================================================
  // ACTIVAR
  // ==========================================================

  /** PATCH /usuarios/:id/activar */
  activar: async (
    id: string,
  ): Promise<void> => {
    await http.patch(
      `/usuarios/${id}/activar`,
    );
  },

  // ==========================================================
  // REENVIAR INVITACIÓN
  // ==========================================================

  /** POST /usuarios/:id/reenviar-invitacion */
  reenviarInvitacion: async (
    id: string,
  ): Promise<void> => {
    await http.post(
      `/usuarios/${id}/reenviar-invitacion`,
    );
  },
};