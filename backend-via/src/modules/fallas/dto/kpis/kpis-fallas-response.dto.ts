import { NivelAlertaColor } from '../../../../common/enums';

/**
 * KPI 1: Total fallas en el mes en curso, con semáforo.
 */
export class KpiTotalMesActualDto {
  /** Total de fallas (Riel + Soldadura) creadas en el mes actual. */
  total!: number;

  /** Color del semáforo según los umbrales. */
  color!: NivelAlertaColor;

  /** Mes y año del cálculo (ej: "Mayo 2026"). */
  periodo!: string;
}

/**
 * KPI 2: Tramo con más fallas en los últimos 12 meses.
 */
export class KpiTramoTopDto {
  /** Código del tramo. Si no hay datos, null. */
  tramoCodigo!: string | null;
  tramoNombre!: string | null;
  cantidadFallas!: number;

  /** Rango analizado: "Mayo 2025 - Abril 2026". */
  rango!: string;
}

/**
 * KPI 3: Fallas de soldadura sin acción definida (POR_DEFINIR).
 */
export class KpiSoldadurasSinAccionDto {
  cantidad!: number;
  /** true si cantidad >= 1 (informe lo marca como crítico). */
  critico!: boolean;
}

/**
 * RESPONSE DTO completo de los 3 KPIs.
 */
export class KpisFallasResponseDto {
  totalMesActual!: KpiTotalMesActualDto;
  tramoTop!: KpiTramoTopDto;
  soldadurasSinAccion!: KpiSoldadurasSinAccionDto;

  /** Timestamp del cálculo. Útil para mostrar "actualizado hace X". */
  calculadoEn!: Date;
}