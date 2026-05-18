import {
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ANIO_MINIMO } from '../../../../common/constants/desgaste.constants';

/**
 * Una celda modificada en la grilla de valores anuales.
 *
 *  - mtb número → upsert con ese valor
 *  - mtb null   → borrar el registro de ese año
 */
export class CambioMtbDto {
  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(2100)
  anio!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0, { message: 'El MTB no puede ser negativo' })
  @Max(99999.999, { message: 'El MTB excede el máximo permitido' })
  mtb!: number | null;
}