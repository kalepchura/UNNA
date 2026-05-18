
import { Grafico2ConfigDto } from './grafico-2-config.dto';

export class Grafico2BarraDto {
  categoria!: string;
  total!: number;
}

export class Grafico2MetadataDto {
  totalFallas!: number;
  calculadoEn!: Date;
}

export class Grafico2ResponseDto {
  configAplicada!: Required<Grafico2ConfigDto>;
  barras!: Grafico2BarraDto[];
  metadata!: Grafico2MetadataDto;
}