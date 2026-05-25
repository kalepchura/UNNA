import { IsOptional, IsEnum, IsDateString, IsArray, IsInt } from 'class-validator';
import {
  TipoFallaFiltro,
  TipoViaFiltro,
  CategoriaG2,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  EstadoFalla,
} from '../../../../../common/enums';

export class Grafico2ConfigDto {
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsEnum(TipoFallaFiltro)
  tipoFalla?: TipoFallaFiltro;

  @IsOptional()
  @IsEnum(TipoViaFiltro)
  tipoVia?: TipoViaFiltro;

  @IsOptional()
  @IsEnum(CategoriaG2)
  categoria?: CategoriaG2;

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

  @IsOptional()
  @IsArray()
  @IsEnum(TipoDefectoRiel, { each: true })
  tipoDefectos?: TipoDefectoRiel[];

  @IsOptional()
  @IsArray()
  @IsEnum(ElementoAfectadoRiel, { each: true })
  elementosAfectados?: ElementoAfectadoRiel[];

  @IsOptional()
  @IsArray()
  @IsEnum(ZonaAfectadaRiel, { each: true })
  zonasAfectadas?: ZonaAfectadaRiel[];

  @IsOptional()
  @IsArray()
  @IsEnum(PerfilFallaRiel, { each: true })
  perfiles?: PerfilFallaRiel[];

  @IsOptional()
  @IsArray()
  @IsEnum(EstadoFalla, { each: true })
  estadosActuales?: EstadoFalla[];
}