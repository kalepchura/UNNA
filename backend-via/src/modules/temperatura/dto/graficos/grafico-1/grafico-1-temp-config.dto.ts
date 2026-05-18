import { IsEnum, IsInt, IsOptional, Min, Max, IsArray, IsDateString } from 'class-validator';
import { GranularidadTempG1 } from '../../../../../common/enums';

/**
 * Configuración del Gráfico G1 – Temperatura.
 *
 * - granularidad DIARIA: requiere obligatoriamente fechaDesde y fechaHasta.
 * - granularidad MENSUAL o ANUAL: basta con el año o rango de años.
 */
export class GraficoG1TempConfigDto {
  @IsOptional()
  @IsEnum(GranularidadTempG1)
  granularidad?: GranularidadTempG1;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anioInicio?: number;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anioFin?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tramoIds?: number[];

  /** Solo aplica con granularidad DIARIA */
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  /** Solo aplica con granularidad DIARIA */
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}