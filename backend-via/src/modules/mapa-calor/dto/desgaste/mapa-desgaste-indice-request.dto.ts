import { IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { PuntoW } from '../../../../common/enums';

export class MapaDesgasteIndiceRequestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  escenarioIdA?: number;

  @IsOptional()
  @IsEnum(PuntoW)
  puntoWA?: PuntoW;

  @IsOptional()
  @IsInt()
  @Min(1)
  escenarioIdB?: number;

  @IsOptional()
  @IsEnum(PuntoW)
  puntoWB?: PuntoW;

  @IsOptional()
  @IsDateString({}, { message: 'fechaCorte debe ser YYYY-MM-DD' })
  fechaCorte?: string;
}