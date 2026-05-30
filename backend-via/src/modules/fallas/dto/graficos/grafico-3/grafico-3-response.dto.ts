// backend/src/modules/fallas/dto/graficos/grafico-3/grafico-3-response.dto.ts

import { NivelAnalisis } from '../../../enums/fallas-graficos.enums';

export class Grafico3SerieDto {
  /** "Total", "Riel" o "Soldadura". */
  nombre!: string;
  /** "TOTAL", "RIEL" o "SOLDADURA". */
  codigo!: string;
  /** Una entrada por velocidad. */
  datos!: number[];
}

export class Grafico3MetadataDto {
  totalFallas!: number;
  calculadoEn!: Date;
  nivel?: NivelAnalisis;
  mensaje?: string;
}

export class Grafico3ResponseDto {
  /** Velocidades del catálogo ascendente. Ej: ['40 km/h','50 km/h',...] */
  categorias!: string[];

  series!: Grafico3SerieDto[];

  metadata!: Grafico3MetadataDto;
}