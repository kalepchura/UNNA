import {
  IsString, IsEmail, IsEnum, IsNotEmpty, MaxLength, MinLength,
} from 'class-validator';
import { RolUsuario } from '../../../common/enums';

/**
 * REQUEST DTO — Solo lo usa el ADMINISTRADOR para crear usuarios.
 *
 * El backend invoca supabase.auth.admin.createUser() con estos datos
 * y replica el registro en usuarios_app.
 */
export class CrearUsuarioDto {
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  @MaxLength(150)
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150)
  nombre!: string;

  /**
   * Contraseña inicial. El usuario podrá cambiarla después
   * (con "olvidé mi contraseña" → recuperación de Supabase).
   */
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede tener más de 72 caracteres' })
  password!: string;

  @IsEnum(RolUsuario, {
    message: `El rol debe ser uno de: ${Object.values(RolUsuario).join(', ')}`,
  })
  rol!: RolUsuario;
}