import { GraficoG2TempConfigDto } from './grafico-2-temp-config.dto';

export class GraficoG2TempBarraDto {
  codigo!: string;
  nombre!: string;
  min!: number | null;
  avg!: number | null;
  max!: number | null;
  cantidadRegistros!: number;
}

export class GraficoG2TempMetadataDto {
  totalRegistros!: number;
  calculadoEn!: Date;
}

export class GraficoG2TempResponseDto {
  configAplicada!: GraficoG2TempConfigDto;
  barras!: GraficoG2TempBarraDto[];
  metadata!: GraficoG2TempMetadataDto;
}