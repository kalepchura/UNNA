import { NivelAlertaColor } from '@/lib/types/common';

export interface KpiZonaRoja {
  cantidad: number;
  color: NivelAlertaColor;
}

export interface KpiMayorDesgaste {
  codigoElemento: number | null;
  tramoCodigo: string | null;
  tramoNombre: string | null;
  via: string | null;
  punto: 'W1' | 'W2' | 'W3R' | 'W3L' | null;
  valorMm: number | null;
  anio: number | null;
  trimestre: number | null;
  color: NivelAlertaColor;
}

export interface ElementoSinMedicion {
  codigoElemento: number;
  tramoCodigo: string;
  via: string;
}

export interface KpiSinMedicionUltimoAnio {
  cantidad: number;
  anioReferencia: number | null;
  color: NivelAlertaColor;
  primerosElementos: ElementoSinMedicion[];
}

export interface KpisDesgasteResponse {
  zonaRoja: KpiZonaRoja;
  mayorDesgaste: KpiMayorDesgaste;
  sinMedicionUltimoAnio: KpiSinMedicionUltimoAnio;
  calculadoEn: string;
}