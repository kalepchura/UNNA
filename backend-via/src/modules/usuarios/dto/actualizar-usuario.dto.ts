import {
  IsOptional, IsString, IsEnum, IsBoolean, MaxLength,
} from 'class-validator';
import { RolUsuario } from '../../../common/enums';

/**
 * REQUEST DTO — Editar un usuario existente.
 *
 * El correo NO se puede editar (es la clave de Supabase Auth).
 * La contraseña tampoco (eso se hace por "reset password").
 */
export class ActualizarUsuarioDto {
  @IsOptional() @IsString() @MaxLength(150)
  nombre?: string;

  @IsOptional() @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional() @IsBoolean()
  activo?: boolean;
}