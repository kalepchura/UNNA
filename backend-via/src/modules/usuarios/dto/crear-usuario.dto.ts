import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { RolUsuario } from '../../../common/enums';

/**
 * REQUEST DTO — Solo lo usa el ADMINISTRADOR para crear usuarios.
 *
 * El backend invoca supabase.auth.admin.inviteUserByEmail() con estos datos.
 * El usuario recibe un email con un link para establecer su propia contraseña.
 * NO se acepta contraseña aquí — el usuario la define él mismo.
 */
export class CrearUsuarioDto {
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  @MaxLength(150)
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150)
  nombre!: string;

  @IsEnum(RolUsuario, {
    message: `El rol debe ser uno de: ${Object.values(RolUsuario).join(', ')}`,
  })
  rol!: RolUsuario;
}