import { GraficoG1TempConfigDto } from './grafico-1-temp-config.dto';

export class GraficoG1TempValoresDto {
  min!: (number | null)[];
  avg!: (number | null)[];
  max!: (number | null)[];
}

export class GraficoG1TempSerieDto {
  codigo!: string;
  nombre!: string;
  valores!: GraficoG1TempValoresDto;
}

export class GraficoG1TempMetadataDto {
  totalRegistros!: number;
  calculadoEn!: Date;
}

export class GraficoG1TempResponseDto {
  /** Configuración exacta que se aplicó (puede incluir fechaDesde/fechaHasta) */
  configAplicada!: GraficoG1TempConfigDto;
  categorias!: string[];
  series!: GraficoG1TempSerieDto[];
  metadata!: GraficoG1TempMetadataDto;
}