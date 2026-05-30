// backend/src/modules/fallas/dto/graficos/grafico-1/grafico-1-request.dto.ts

import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Grafico1ConfigDto } from './grafico-1-config.dto';

/**
 * Request del Gráfico 1.
 *
 * `config` es opcional a nivel HTTP (para permitir un body vacío que
 * el service responde con "configura los filtros"), pero si viene,
 * sus campos obligatorios se validan dentro del service.
 */
export class Grafico1RequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => Grafico1ConfigDto)
  config?: Grafico1ConfigDto;
}