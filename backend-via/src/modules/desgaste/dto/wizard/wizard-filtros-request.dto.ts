import {
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
  IsIn,
} from 'class-validator';
import { TipoAgrupacionDesgaste, TipoViaFiltro } from '../../../../common/enums';

/**
 * Request del wizard de filtros (G1 y G3).
 *
 * Cambios respecto a la versión anterior:
 *  - agrupacionId (singular) → se mantiene por retrocompatibilidad con G1
 *  - agrupacionIds (plural)  → nuevo, para G3 con múltiples selecciones
 *
 * El service usa agrupacionIds si está presente, sino cae a agrupacionId.
 */
export class WizardFiltrosRequestDto {
  @IsInt()
  @Min(1)
  @Max(6)
  paso!: number;

  @IsOptional()
  @IsEnum(TipoAgrupacionDesgaste)
  tipoAgrupacion?: TipoAgrupacionDesgaste;

  /**
   * ID singular de agrupación (retrocompatibilidad G1).
   * Para el G3 usar agrupacionIds[].
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  agrupacionId?: number;

  /**
   * IDs múltiples de agrupación (G3 — paso 4).
   * Si se envía este campo, tiene prioridad sobre agrupacionId.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  agrupacionIds?: number[];

  @IsOptional()
  @IsEnum(TipoViaFiltro)
  via?: TipoViaFiltro;
}