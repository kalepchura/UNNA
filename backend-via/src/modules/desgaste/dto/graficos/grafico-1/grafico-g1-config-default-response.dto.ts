import {
  TipoAgrupacionDesgaste,
  TipoViaFiltro,
  PuntoW,
} from '../../../../../common/enums';

/**
 * RESPONSE del endpoint que devuelve la "config sugerida default"
 * para inicializar el wizard del frontend.
 *
 * Algunos campos NO se conocen sin consultar el catálogo:
 *  - valorAgrupacion: depende del catálogo (primer tramo)
 *  - elementoCodigos: depende del catálogo (todos los elementos del filtro)
 *
 * Por eso el backend resuelve esto y entrega la config "lista".
 */
export class GraficoG1ConfigDefaultResponseDto {
  tipoAgrupacion!: TipoAgrupacionDesgaste;
  valorAgrupacion!: string;
  via!: TipoViaFiltro;
  elementoCodigos!: string[]; // todos los elementos del filtro inicial
  puntosW!: PuntoW[];
}