import { NivelAlertaColor } from '../../../../common/enums';
import { SegmentacionFallas } from './mapa-fallas-request.dto';

/**
 * Un elemento coloreado del mapa de fallas.
 * Sirve para tramos, cambiavías, curvas H y V (todos los segmentables).
 *
 * `progresivaInicio` y `progresivaFin` son iguales para puntos
 * (cambiavías) y distintos para segmentos (tramos, curvas).
 */
export class ElementoColoreadoFallasDto {
  /** Código del elemento. */
  codigo!: string;
  nombre!: string;
  progresivaInicio!: number;
  progresivaFin!: number;
  /** Conteo total de fallas en el rango. */
  cantidadFallas!: number;
  color!: NivelAlertaColor;
}

/**
 * Una "línea" del mapa.
 * - TRAMO: 1 línea sin separación de vía
 * - CAMBIAVIA: 4 líneas (PAR/IMPAR/TERCERA/CERO)
 * - CURVA_*: 2 líneas (PAR/IMPAR)
 */
export class LineaFallasDto {
  /** Identificador de la línea. Para TRAMO es 'BASE'. */
  via!: string;
  etiqueta!: string;
  /** Elementos ordenados por progresivaInicio ASC. */
  elementos!: ElementoColoreadoFallasDto[];
}

export class MapaFallasResponseDto {
  filtrosAplicados!: {
    fechaDesde: string;
    fechaHasta: string;
    segmentacion: SegmentacionFallas;
  };
  /** Líneas del mapa (1, 2 o 4 según segmentación). */
  lineas!: LineaFallasDto[];
  metadata!: {
    totalElementos: number;
    elementosConFallas: number;
    elementosSinFallas: number;
    calculadoEn: Date;
  };
}