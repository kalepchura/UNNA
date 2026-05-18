import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * REQUEST DTO para listar escenarios.
 * Filtros opcionales: búsqueda por nombre.
 */
export class FiltrarEscenariosMtbDto {
  /** Substring para buscar en nombre (case-insensitive). */
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;
}