import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Grafico1ConfigDto } from './grafico-1-config.dto';

/**
 * REQUEST DTO del Gráfico 1.
 *
 * El cliente puede enviar:
 *  - Body vacío {} → usa toda la config default
 *  - Body con config parcial → mergea con default
 *  - Body con config completa → usa esa
 */
export class Grafico1RequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => Grafico1ConfigDto)
  config?: Grafico1ConfigDto;
}