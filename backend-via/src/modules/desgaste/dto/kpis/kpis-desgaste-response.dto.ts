import { NivelAlertaColor, PuntoW } from '../../../../common/enums';

/**
 * KPI 1 — Cantidad de elementos en zona roja (último W > 8 mm en cualquier punto).
 */
export class KpiZonaRojaDto {
  cantidad!: number;
  color!: NivelAlertaColor;
}

/**
 * KPI 2 — Elemento con mayor desgaste actual.
 * Devuelve null si no hay mediciones.
 */
export class KpiMayorDesgasteDto {
  codigoElemento!: number | null;
  tramoCodigo!: string | null;
  tramoNombre!: string | null;
  via!: string | null;
  /** Punto W donde se registró el mayor valor. */
  punto!: PuntoW | null;
  valorMm!: number | null;
  /** Año-trimestre del registro. */
  anio!: number | null;
  trimestre!: number | null;
  color!: NivelAlertaColor;
}

/**
 * KPI 3 — Elementos sin medición en el último año del sistema.
 */
export class KpiSinMedicionUltimoAnioDto {
  cantidad!: number;
  /**
   * Año analizado. Es el MAX(anio) de toda la tabla mediciones_desgaste.
   * null si no hay mediciones en absoluto.
   */
  anioReferencia!: number | null;
  color!: NivelAlertaColor;

  /**
   * Lista (limitada a 50) de códigos de elementos sin medición.
   * Útil para mostrar el detalle al equipo de campo.
   */
  primerosElementos!: Array<{
    codigoElemento: number;
    tramoCodigo: string;
    via: string;
  }>;
}

export class KpisDesgasteResponseDto {
  zonaRoja!: KpiZonaRojaDto;
  mayorDesgaste!: KpiMayorDesgasteDto;
  sinMedicionUltimoAnio!: KpiSinMedicionUltimoAnioDto;
  calculadoEn!: Date;
}