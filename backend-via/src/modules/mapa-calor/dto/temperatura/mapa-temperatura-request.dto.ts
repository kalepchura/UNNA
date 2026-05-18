import { IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum TipoValorTemperatura {
  PROMEDIO = 'PROMEDIO',
  MAXIMO = 'MAXIMO',
}

/**
 * REQUEST DTO para la capa Temperatura del Mapa de Calor.
 *
 * Defaults (informe sección 8):
 *  - fechaDesde: primer día del año actual
 *  - fechaHasta: hoy
 *  - tipoValor: PROMEDIO
 *
 * Si el cliente manda {} todo va con default.
 */
export class MapaTemperaturaRequestDto {
  /** Formato ISO YYYY-MM-DD. */
  @IsOptional()
  @IsDateString({}, { message: 'fechaDesde debe ser YYYY-MM-DD' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fechaHasta debe ser YYYY-MM-DD' })
  fechaHasta?: string;

  @IsOptional()
  @IsEnum(TipoValorTemperatura)
  tipoValor?: TipoValorTemperatura;
}