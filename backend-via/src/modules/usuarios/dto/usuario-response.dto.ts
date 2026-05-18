import { UsuarioApp } from '../entities/usuario-app.entity';
import { RolUsuario } from '../../../common/enums';

/**
 * RESPONSE DTO. Es lo que devolvemos al frontend.
 *
 * NUNCA exponemos contraseña ni datos sensibles de Supabase Auth.
 */
export class UsuarioResponseDto {
  id!: string;
  nombre!: string;
  correo!: string;
  rol!: RolUsuario;
  activo!: boolean;
  creadoEn!: Date;
  actualizadoEn!: Date;

  static fromEntity(u: UsuarioApp): UsuarioResponseDto {
    const dto = new UsuarioResponseDto();
    dto.id = u.id;
    dto.nombre = u.nombre;
    dto.correo = u.correo;
    dto.rol = u.rol;
    dto.activo = u.activo;
    dto.creadoEn = u.creadoEn;
    dto.actualizadoEn = u.actualizadoEn;
    return dto;
  }
}