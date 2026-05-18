import {
  IsInt,
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { TipoVia, LadoRiel } from '../../../../common/enums';

/**
 * REQUEST DTO — Crear una FallaRiel.
 *
 * El usuario envía SOLO los datos directos.
 * Tramo, curvas y velocidad los calcula el backend desde (progresiva, via).
 */
export class CrearFallaRielDto {
  @IsInt({ message: 'La progresiva debe ser un número entero' })
  @Min(0, { message: 'La progresiva no puede ser negativa' })
  progresiva!: number;

  @IsEnum(TipoVia, { message: `Vía debe ser una de: ${Object.values(TipoVia).join(', ')}` })
  via!: TipoVia;

  /** Fecha en formato YYYY-MM-DD. */
  @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
  fecha!: string;

  @IsEnum(LadoRiel)
  carril!: LadoRiel;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  causa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  origen?: string;
}