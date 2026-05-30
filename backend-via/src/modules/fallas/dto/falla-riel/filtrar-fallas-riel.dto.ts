import {
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoVia,
  LadoRiel,
  EstadoFalla,
  AccionRiel,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
} from '../../../../common/enums';

/**
 * REQUEST DTO — Filtros para listar FallaRiel.
 *
 * 🎯 El frontend envía IDs directamente desde sus selectores
 * (dropdowns ya cargados con los catálogos). No se hace
 * traducción de strings en el backend.
 *
 * Esto da:
 *  - Performance: cero queries extras de resolución
 *  - Consistencia: mismo patrón que los gráficos
 *  - Seguridad: imposible filtrar por IDs que no existen
 *
 * ============================================================
 * FILTROS POR ENUM (multi-select)
 * ============================================================
 * Cada array es opcional. Vacío o ausente = no acota.
 * Si trae 1+ valores → WHERE col IN (...valores).
 *
 * Filtros sobre los campos DESNORMALIZADOS de FallaRiel:
 *   - estadosActuales  → f.estado_actual
 *   - accionesActuales → f.accion_actual (puede ser NULL si
 *     la falla aún no tiene ninguna acción registrada).
 *
 * Filtros sobre los enums de caracterización:
 *   - tipoDefectos, elementosAfectados, zonasAfectadas,
 *     perfiles, altasBajas
 *   Estos NUNCA son NULL en BD (default SIN_DEFINIR o NO_APLICA).
 * ============================================================
 */
export class FiltrarFallasRielDto {
  /**
   * IDs de tramos seleccionados en el dropdown del frontend.
   * Ej: [1, 2, 5]
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  tramoIds?: number[];

  /**
   * IDs de curvas horizontales seleccionadas.
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  curvaHorizontalIds?: number[];

  /**
   * IDs de curvas verticales seleccionadas.
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  curvaVerticalIds?: number[];

  @IsOptional()
  @IsEnum(TipoVia)
  via?: TipoVia;

  @IsOptional()
  @IsEnum(LadoRiel)
  carril?: LadoRiel;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  // ============================================================
  // FILTROS POR ENUM (FASE 3 — Listado completo)
  // ============================================================

  /** Estado actual de la falla (desnormalizado). */
  @IsOptional()
  @IsArray()
  @IsEnum(EstadoFalla, { each: true })
  estadosActuales?: EstadoFalla[];

  /** Acción actual de la falla (desnormalizada, puede ser NULL). */
  @IsOptional()
  @IsArray()
  @IsEnum(AccionRiel, { each: true })
  accionesActuales?: AccionRiel[];

  /** Tipo de defecto físico. */
  @IsOptional()
  @IsArray()
  @IsEnum(TipoDefectoRiel, { each: true })
  tipoDefectos?: TipoDefectoRiel[];

  /** Elemento afectado en vía corrida. */
  @IsOptional()
  @IsArray()
  @IsEnum(ElementoAfectadoRiel, { each: true })
  elementosAfectados?: ElementoAfectadoRiel[];

  /** Zona del perfil donde se manifiesta el defecto. */
  @IsOptional()
  @IsArray()
  @IsEnum(ZonaAfectadaRiel, { each: true })
  zonasAfectadas?: ZonaAfectadaRiel[];

  /** Perfil técnico del riel. */
  @IsOptional()
  @IsArray()
  @IsEnum(PerfilFallaRiel, { each: true })
  perfiles?: PerfilFallaRiel[];

  /** Riel ALTO/BAJO de curva, o NO_APLICA en tangentes. */
  @IsOptional()
  @IsArray()
  @IsEnum(AltaBaja, { each: true })
  altasBajas?: AltaBaja[];

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}