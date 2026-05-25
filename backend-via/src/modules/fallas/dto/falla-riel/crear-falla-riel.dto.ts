import {
  IsInt,
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoVia,
  LadoRiel,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
} from '../../../../common/enums';

/**
 * REQUEST DTO — Crear una FallaRiel.
 *
 * El usuario envía SOLO los datos directos.
 * Tramo, curvas y velocidad los calcula el backend desde (progresiva, via).
 *
 * ============================================================
 * FASE 2 — CAMPOS NUEVOS (todos opcionales)
 * ============================================================
 * Los enums descriptivos (tipoDefecto, elementoAfectado, etc.)
 * son OPCIONALES en el request. Si no llegan, la BD aplica
 * el default SIN_DEFINIR (definido en la entidad). Esto permite
 * registrar fallas con datos parciales en campo.
 *
 * Los valores numéricos (largo, ancho, profundidad, etc.) van
 * como null si no se envían — no se les asigna ningún default.
 *
 * Los 4 campos de "estado actual" (estadoActual, accionActual,
 * ptActual, fechaEjecucionActual) NO se aceptan aquí: son
 * desnormalizados y los administra FallasRielAccionService.
 * Al crear una falla, siempre arrancan en NO_ATENDIDO / null.
 * ============================================================
 */
export class CrearFallaRielDto {
  // ----------------------------------------------------------
  // CAMPOS ORIGINALES (obligatorios o ya existentes)
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // FASE 2 — CARACTERIZACIÓN (enums opcionales, default SIN_DEFINIR en BD)
  // ----------------------------------------------------------

  @IsOptional()
  @IsEnum(TipoDefectoRiel, {
    message: `tipoDefecto debe ser uno de: ${Object.values(TipoDefectoRiel).join(', ')}`,
  })
  tipoDefecto?: TipoDefectoRiel;

  @IsOptional()
  @IsEnum(ElementoAfectadoRiel, {
    message: `elementoAfectado debe ser uno de: ${Object.values(ElementoAfectadoRiel).join(', ')}`,
  })
  elementoAfectado?: ElementoAfectadoRiel;

  @IsOptional()
  @IsEnum(ZonaAfectadaRiel, {
    message: `zonaAfectada debe ser una de: ${Object.values(ZonaAfectadaRiel).join(', ')}`,
  })
  zonaAfectada?: ZonaAfectadaRiel;

  @IsOptional()
  @IsEnum(PerfilFallaRiel, {
    message: `perfil debe ser uno de: ${Object.values(PerfilFallaRiel).join(', ')}`,
  })
  perfil?: PerfilFallaRiel;

  @IsOptional()
  @IsEnum(AltaBaja, {
    message: `altaBaja debe ser uno de: ${Object.values(AltaBaja).join(', ')}`,
  })
  altaBaja?: AltaBaja;

  // ----------------------------------------------------------
  // FASE 2 — MEDIDAS DEL DEFECTO (numéricos opcionales)
  // ----------------------------------------------------------

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  progresivaFinal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  largo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ancho?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  profundidad?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  numeroFoto?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoOnda?: string;
}