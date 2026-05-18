import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsDateString,
  IsUUID,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';

/**
 * REQUEST DTO para listar el log con filtros (página de Auditoría).
 * Solo accesible por ADMINISTRADOR.
 *
 * Por defecto muestra los últimos 30 días si no se manda rango.
 * (Ese default lo aplica el service, no el DTO.)
 */
export class FiltrarAuditoriaDto {
  @IsOptional()
  @IsEnum(ModuloAuditoria)
  modulo?: ModuloAuditoria;

  /**
   * Multi-selección de operaciones. Llega como ?operacion=CREATE&operacion=UPDATE
   * o como ?operacion=CREATE,UPDATE — manejamos ambos casos.
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    return [value];
  })
  @IsArray()
  @IsEnum(OperacionAuditoria, { each: true })
  operacion?: OperacionAuditoria[];

  /** Filtrar por usuario específico (UUID). */
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  /**
   * Rango de fechas (formato ISO YYYY-MM-DD).
   * Si solo viene desde, hasta = hoy.
   * Si solo viene hasta, desde = hace 30 días.
   */
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  /** Búsqueda libre dentro del campo `detalle` (JSONB). */
  @IsOptional()
  @IsString()
  detalleTexto?: string;

  // Paginación
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 50;
}