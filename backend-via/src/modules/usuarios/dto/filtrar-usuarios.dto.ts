import {
  IsOptional, IsString, IsInt, IsEnum, IsBoolean, Min, Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RolUsuario } from '../../../common/enums';

export class FiltrarUsuariosDto {
  @IsOptional() @IsString()
  correo?: string;

  @IsOptional() @IsString()
  nombre?: string;

  @IsOptional() @IsEnum(RolUsuario)
  rol?: RolUsuario;

  /**
   * Convierte "true"/"false" del query param a boolean real.
   * (los query params SIEMPRE llegan como string)
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activo?: boolean;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;
}