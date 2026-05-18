import { IsOptional, IsEnum, IsDateString } from 'class-validator';

/**
 * Las 4 segmentaciones soportadas en el mapa de Fallas.
 * Determina la query y la estructura del response.
 */
export enum SegmentacionFallas {
  TRAMO = 'TRAMO',
  CAMBIAVIA = 'CAMBIAVIA',
  CURVA_HORIZONTAL = 'CURVA_HORIZONTAL',
  CURVA_VERTICAL = 'CURVA_VERTICAL',
}

/**
 * REQUEST DTO para la capa Fallas.
 *
 * Defaults (informe sección 8 - Capa Fallas):
 *  - fechaDesde: hoy - 12 meses
 *  - fechaHasta: hoy
 *  - segmentacion: TRAMO
 */
export class MapaFallasRequestDto {
  @IsOptional()
  @IsDateString({}, { message: 'fechaDesde debe ser YYYY-MM-DD' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fechaHasta debe ser YYYY-MM-DD' })
  fechaHasta?: string;

  @IsOptional()
  @IsEnum(SegmentacionFallas)
  segmentacion?: SegmentacionFallas;
}