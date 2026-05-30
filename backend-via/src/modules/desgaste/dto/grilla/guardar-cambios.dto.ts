import {
  IsArray,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PuntoW } from '../../../../common/enums';
import {
  ANIO_MINIMO,
} from '../../../../common/constants/desgaste.constants';

export class CeldaModificadaDto {
  @IsInt()
  @Min(1)
  elementoId!: number;

  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(2100)
  anio!: number;

  @IsInt()
  @Min(1)
  @Max(4)
  trimestre!: number;

  @IsEnum(PuntoW)
  punto!: PuntoW;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-50)
  @Max(50)
  valor!: number | null;
}

export class GuardarCambiosDto {
  @IsInt()
  @Min(1)
  escenarioId!: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos una celda modificada' })
  @ValidateNested({ each: true })
  @Type(() => CeldaModificadaDto)
  cambios!: CeldaModificadaDto[];
}