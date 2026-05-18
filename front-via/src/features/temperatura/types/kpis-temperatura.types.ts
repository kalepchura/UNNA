import { NivelAlertaColor } from '@/lib/types/common';

export interface KpiMaximaUltimoMes {
  valorCelsius: number | null;
  progresiva: number | null;
  tramoCodigo: string | null;
  tramoNombre: string | null;
  fecha: string | null; // ISO string desde el backend
  color: NivelAlertaColor;
  rango: string;
}

export interface KpiZonasAlertaAnio {
  cantidad: number;
  color: NivelAlertaColor;
  anio: number;
  tramos: Array<{
    codigo: string;
    nombre: string;
  }>;
}

export interface KpiDiasConsecutivos {
  dias: number;
  color: NivelAlertaColor;
  tramoCodigo: string | null;
  tramoNombre: string | null;
  promedioCelsius: number | null;
}

export interface KpisTemperaturaResponse {
  maximaUltimoMes: KpiMaximaUltimoMes;
  zonasAlertaAnio: KpiZonasAlertaAnio;
  diasConsecutivos: KpiDiasConsecutivos;
  calculadoEn: string;
}