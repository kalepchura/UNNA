import { NivelAlertaColor, PuntoW } from '../../../../common/enums';

export class PuntoColoreadoDesgasteDto {
  codigoElemento!: number;
  progresiva!: number;
  valorMm!: number | null;
  color!: NivelAlertaColor;
  anio!: number | null;
  trimestre!: number | null;
}

export class LineaDesgasteDto {
  via!: string;
  riel!: string;
  etiqueta!: string;
  puntos!: PuntoColoreadoDesgasteDto[];
}

export class MapaDesgasteGeneralResponseDto {
  filtrosAplicados!: {
    escenarioId: number;
    puntoW: PuntoW;
    fechaCorte: string;
  };
  lineas!: LineaDesgasteDto[];
  metadata!: {
    totalElementos: number;
    elementosConDatos: number;
    elementosSinDatos: number;
    calculadoEn: Date;
  };
}