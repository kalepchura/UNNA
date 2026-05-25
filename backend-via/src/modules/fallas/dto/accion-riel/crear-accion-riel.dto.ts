import {
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AccionRiel, EstadoFalla } from '../../../../common/enums';

/**
 * REQUEST DTO — Crear una FallaRielAccion.
 *
 * El frontend envía los datos de la intervención. El fallaId no
 * viene en el body sino en la URL: POST /fallas/riel/:id/acciones
 *
 * Reglas:
 *  - accion: obligatorio (qué se hizo o se programó)
 *  - conclusion: obligatorio (en qué estado quedó: PROGRAMADO, RESUELTO, etc.)
 *  - pt y fechaEjecucion: opcionales (puede haberse registrado antes
 *    de tener el PT asignado, o sin fecha definitiva todavía)
 *  - observaciones: opcional
 */
export class CrearAccionRielDto {
  @IsEnum(AccionRiel, {
    message: `La acción debe ser una de: ${Object.values(AccionRiel).join(', ')}`,
  })
  accion!: AccionRiel;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  pt?: string;

  /** Fecha en formato YYYY-MM-DD. */
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
  fechaEjecucion?: string;

  @IsEnum(EstadoFalla, {
    message: `La conclusión debe ser una de: ${Object.values(EstadoFalla).join(', ')}`,
  })
  conclusion!: EstadoFalla;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}