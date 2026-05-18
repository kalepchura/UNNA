import { NivelAlertaColor } from '../../../../common/enums';
import { TipoValorTemperatura } from './mapa-temperatura-request.dto';

/**
 * Un tramo del mapa de calor con su color asignado.
 * El frontend lo dibuja como un segmento continuo.
 */
export class TramoColoreadoTemperaturaDto {
  codigo!: string;
  nombre!: string;
  progresivaInicio!: number;
  progresivaFin!: number;

  /**
   * Valor calculado (promedio o máximo) en °C.
   * null si no hay mediciones en el rango.
   */
  valor!: number | null;

  /**
   * Color del semáforo según los umbrales del informe.
   * GRIS si valor es null.
   */
  color!: NivelAlertaColor;

  /**
   * Cantidad de mediciones consideradas (debug + tooltip).
   * 0 cuando no hay datos.
   */
  cantidadMediciones!: number;
}

/**
 * Filtros aplicados (resueltos contra defaults).
 */
export class MapaTemperaturaFiltrosAplicadosDto {
  fechaDesde!: string;
  fechaHasta!: string;
  tipoValor!: TipoValorTemperatura;
}

export class MapaTemperaturaResponseDto {
  filtrosAplicados!: MapaTemperaturaFiltrosAplicadosDto;

  /** TODOS los tramos del catálogo, ordenados por progresiva ASC. */
  tramos!: TramoColoreadoTemperaturaDto[];

  metadata!: {
    totalTramos: number;
    tramosConDatos: number;
    tramosSinDatos: number;
    calculadoEn: Date;
  };
}