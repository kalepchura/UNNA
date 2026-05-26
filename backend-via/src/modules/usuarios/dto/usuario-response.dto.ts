import { UsuarioApp } from '../entities/usuario-app.entity';
import { RolUsuario } from '../../../common/enums';

/**
 * RESPONSE DTO. Es lo que devolvemos al frontend.
 *
 * NUNCA exponemos contraseña ni datos sensibles de Supabase Auth.
 * invitacionPendiente = true si el usuario aún no confirmó su email
 * (nunca hizo clic en el link de invitación).
 */
export class UsuarioResponseDto {
  id!: string;
  nombre!: string;
  correo!: string;
  rol!: RolUsuario;
  activo!: boolean;
  invitacionPendiente!: boolean;
  creadoEn!: Date;
  actualizadoEn!: Date;

  static fromEntity(
    u: UsuarioApp,
    invitacionPendiente = false,
  ): UsuarioResponseDto {
    const dto = new UsuarioResponseDto();
    dto.id = u.id;
    dto.nombre = u.nombre;
    dto.correo = u.correo;
    dto.rol = u.rol;
    dto.activo = u.activo;
    dto.invitacionPendiente = invitacionPendiente;
    dto.creadoEn = u.creadoEn;
    dto.actualizadoEn = u.actualizadoEn;
    return dto;
  }
}