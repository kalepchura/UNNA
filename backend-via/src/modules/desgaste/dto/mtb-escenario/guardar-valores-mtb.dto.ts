import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CambioMtbDto } from './cambio-mtb.dto';

/**
 * REQUEST DTO para guardar valores MTB en lote.
 * Solo se envían los años MODIFICADOS (delta).
 */
export class GuardarValoresMtbDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos un cambio' })
  @ValidateNested({ each: true })
  @Type(() => CambioMtbDto)
  cambios!: CambioMtbDto[];
}