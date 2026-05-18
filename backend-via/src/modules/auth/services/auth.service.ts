import { Injectable } from '@nestjs/common';
import { UsuariosService } from '../../usuarios/services/usuarios.service';

/**
 * AuthService — actualmente solo redirige a UsuariosService para /me.
 * En el futuro podría manejar lógica adicional (ej: refrescar tokens,
 * registrar último login, etc.).
 */
@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  /** Devuelve el perfil completo del usuario autenticado. */
  async obtenerPerfil(userId: string) {
    return this.usuariosService.obtenerPorId(userId);
  }
}