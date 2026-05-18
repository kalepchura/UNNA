import { IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { PuntoW } from '../../../../common/enums';

export class MapaDesgasteGeneralRequestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  escenarioId?: number;

  @IsOptional()
  @IsEnum(PuntoW)
  puntoW?: PuntoW;

  @IsOptional()
  @IsDateString({}, { message: 'fechaCorte debe ser YYYY-MM-DD' })
  fechaCorte?: string;
}