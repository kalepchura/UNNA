import { IsEnum, IsInt, IsOptional, Min, Max, IsArray } from 'class-validator';
import {
  GranularidadTemporal,
  TipoFallaFiltro,
  TipoViaFiltro,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  EstadoFalla,
} from '../../../../../common/enums';

export class Grafico1ConfigDto {
  @IsOptional()
  @IsEnum(GranularidadTemporal)
  granularidad?: GranularidadTemporal;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anioInicio?: number;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anioFin?: number;

  @IsOptional()
  @IsEnum(TipoFallaFiltro)
  tipoFalla?: TipoFallaFiltro;

  @IsOptional()
  @IsEnum(TipoViaFiltro)
  tipoVia?: TipoViaFiltro;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tramoIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  curvaHorizontalIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  curvaVerticalIds?: number[];

  // ----------------------------------------------------------
  // FASE 2.D — Filtros nuevos (solo aplican a fallas_riel)
  // ----------------------------------------------------------

  /** Tipos de defecto seleccionados. Aplica solo a fallas_riel. */
  @IsOptional()
  @IsArray()
  @IsEnum(TipoDefectoRiel, { each: true })
  tipoDefectos?: TipoDefectoRiel[];

  /** Elementos afectados seleccionados. Aplica solo a fallas_riel. */
  @IsOptional()
  @IsArray()
  @IsEnum(ElementoAfectadoRiel, { each: true })
  elementosAfectados?: ElementoAfectadoRiel[];

  /** Zonas del riel afectadas. Aplica solo a fallas_riel. */
  @IsOptional()
  @IsArray()
  @IsEnum(ZonaAfectadaRiel, { each: true })
  zonasAfectadas?: ZonaAfectadaRiel[];

  /** Perfiles de riel. Aplica solo a fallas_riel. */
  @IsOptional()
  @IsArray()
  @IsEnum(PerfilFallaRiel, { each: true })
  perfiles?: PerfilFallaRiel[];

  /** Estado actual (desnormalizado de la última acción). Solo riel. */
  @IsOptional()
  @IsArray()
  @IsEnum(EstadoFalla, { each: true })
  estadosActuales?: EstadoFalla[];
}