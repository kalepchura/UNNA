import { NivelAlertaColor } from '@/lib/types/common';

export interface KpiTotalMesActual {
  total: number;
  color: NivelAlertaColor;
  periodo: string;
}

export interface KpiTramoTop {
  tramoCodigo: string | null;
  tramoNombre: string | null;
  cantidadFallas: number;
  rango: string;
}

export interface KpiSoldadurasSinAccion {
  cantidad: number;
  critico: boolean;
}

export interface KpisFallasResponse {
  totalMesActual: KpiTotalMesActual;
  tramoTop: KpiTramoTop;
  soldadurasSinAccion: KpiSoldadurasSinAccion;
  calculadoEn: string;
}