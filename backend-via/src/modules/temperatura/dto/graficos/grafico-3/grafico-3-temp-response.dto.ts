import { GraficoG3TempConfigDto } from './grafico-3-temp-config.dto';

export class GraficoG3TempValoresDto {
  min!: (number | null)[];
  avg!: (number | null)[];
  max!: (number | null)[];
}

export class GraficoG3TempSerieDto {
  codigo!: string;
  nombre!: string;
  valores!: GraficoG3TempValoresDto;
}

export class GraficoG3TempMetadataDto {
  totalRegistros!: number;
  calculadoEn!: Date;
}

export class GraficoG3TempResponseDto {
  configAplicada!: GraficoG3TempConfigDto;
  categorias!: string[];
  series!: GraficoG3TempSerieDto[];
  metadata!: GraficoG3TempMetadataDto;
}