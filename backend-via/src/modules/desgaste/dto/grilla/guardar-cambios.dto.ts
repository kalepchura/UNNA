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
  TRIMESTRES_VALIDOS,
} from '../../../../common/constants/desgaste.constants';

/**
 * Una celda modificada = una tupla atómica (elemento, año, trimestre, W, valor).
 *
 * Si valor es null, significa "borrar este W de esta celda lógica"
 * (no borrar la fila entera).
 */
export class CeldaModificadaDto {
  @IsInt()
  @Min(1)
  elementoId!: number;

  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(2100)
  anio!: number;

  /** Trimestre 1-4. */
  @IsInt()
  @Min(1)
  @Max(4)
  trimestre!: number;

  @IsEnum(PuntoW)
  punto!: PuntoW;

  /**
   * Valor en mm. null para borrar la celda específica.
   * Validación de rango: 0 a 50 (cubre 8mm tolerancia con margen).
   */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(50)
  valor!: number | null;
}

/**
 * REQUEST DTO para guardar cambios.
 * Frontend manda SOLO las celdas que el usuario modificó.
 */
export class GuardarCambiosDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos una celda modificada' })
  @ValidateNested({ each: true })
  @Type(() => CeldaModificadaDto)
  cambios!: CeldaModificadaDto[];
}