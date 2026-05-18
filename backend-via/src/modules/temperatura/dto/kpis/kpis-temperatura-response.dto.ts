import { NivelAlertaColor } from '../../../../common/enums';

/**
 * KPI 1 — Temperatura máxima del último mes.
 * Devuelve también el contexto del registro (dónde y cuándo se midió).
 */
export class KpiMaximaUltimoMesDto {
  /** Valor máximo encontrado, o null si no hay datos. */
  valorCelsius!: number | null;

  /** Información del registro asociado (si hay). */
  progresiva!: number | null;
  tramoCodigo!: string | null;
  tramoNombre!: string | null;
  fecha!: Date | null;

  /** Color del semáforo. GRIS si no hay datos. */
  color!: NivelAlertaColor;

  /** Rango analizado (texto descriptivo para UI). */
  rango!: string;
}

/**
 * KPI 2 — Cantidad de tramos en alerta del año actual.
 */
export class KpiZonasAlertaAnioDto {
  cantidad!: number;
  color!: NivelAlertaColor;

  /** Año analizado (ej: "2026"). */
  anio!: number;

  /** Detalle de tramos en alerta. Ordenados por código. */
  tramos!: Array<{
    codigo: string;
    nombre: string;
  }>;
}

/**
 * KPI 3 — Días consecutivos en alerta de la zona más crítica.
 */
export class KpiDiasConsecutivosDto {
  /** Cantidad de días consecutivos hasta hoy. 0 si no aplica. */
  dias!: number;
  color!: NivelAlertaColor;

  /** Tramo identificado como más crítico (puede ser null si no hay datos). */
  tramoCodigo!: string | null;
  tramoNombre!: string | null;

  /** Promedio que llevó a elegir este tramo. */
  promedioCelsius!: number | null;
}

/**
 * RESPONSE DTO completo de los 3 KPIs juntos.
 */
export class KpisTemperaturaResponseDto {
  maximaUltimoMes!: KpiMaximaUltimoMesDto;
  zonasAlertaAnio!: KpiZonasAlertaAnioDto;
  diasConsecutivos!: KpiDiasConsecutivosDto;
  calculadoEn!: Date;
}