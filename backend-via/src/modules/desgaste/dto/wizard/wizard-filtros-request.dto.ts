import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { TipoAgrupacionDesgaste, TipoViaFiltro } from '../../../../common/enums';

export class WizardFiltrosRequestDto {
  @IsInt()
  @Min(1)
  @Max(6)
  paso!: number;

  @IsOptional()
  @IsEnum(TipoAgrupacionDesgaste)
  tipoAgrupacion?: TipoAgrupacionDesgaste;

  /** ID del tramo/curva seleccionado (paso 2). Necesario desde paso 4. */
  @IsOptional()
  @IsInt()
  @Min(1)
  agrupacionId?: number;

  @IsOptional()
  @IsEnum(TipoViaFiltro)
  via?: TipoViaFiltro;
}