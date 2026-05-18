import { NivelAlertaColor, PuntoW } from '../../../../common/enums';

export class PuntoColoreadoIndiceDto {
  codigoElemento!: number;
  progresiva!: number;
  valorA!: number | null;
  valorB!: number | null;
  indice!: number | null;
  color!: NivelAlertaColor;
  anioA!: number | null;
  trimestreA!: number | null;
  anioB!: number | null;
  trimestreB!: number | null;
}

export class LineaDesgasteIndiceDto {
  via!: string;
  riel!: string;
  etiqueta!: string;
  puntos!: PuntoColoreadoIndiceDto[];
}

export class MapaDesgasteIndiceResponseDto {
  filtrosAplicados!: {
    escenarioIdA: number;
    puntoWA: PuntoW;
    escenarioIdB: number;
    puntoWB: PuntoW;
    fechaCorte: string;
  };
  lineas!: LineaDesgasteIndiceDto[];
  metadata!: {
    totalElementos: number;
    elementosConIndice: number;
    elementosSinDatos: number;
    calculadoEn: Date;
  };
}