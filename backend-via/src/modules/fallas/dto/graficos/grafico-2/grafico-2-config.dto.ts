// backend/src/modules/fallas/dto/graficos/grafico-2/grafico-2-config.dto.ts

import {
  IsEnum, IsOptional, IsDateString, IsArray, IsInt, ArrayNotEmpty,
} from 'class-validator';
import {
  TipoFallaFiltro, CategoriaG2,
  TipoDefectoRiel, ElementoAfectadoRiel, ZonaAfectadaRiel, PerfilFallaRiel,
  EstadoFalla, AccionFalla, UbicacionFalla,
} from '../../../../../common/enums';
import {
  NivelAnalisis, TipoViaFiltroFallas, ModoG2,
} from '../../../enums/fallas-graficos.enums';

/**
 * ============================================================
 * G2 — Distribución por categoría (barras)
 * ============================================================
 * Eje Y siempre = cantidad de fallas.
 *
 * Dos modos conmutables (campo `modo`):
 *  - CATEGORIA: eje X = opciones del enum. Una barra por opción.
 *  - ELEMENTO : eje X = elementos del nivel. Barras apiladas por opción del enum.
 *
 * Tiene filtros AVANZADOS como acotadores opcionales.
 * Vacío en avanzados = no acota (todas las fallas con cualquier valor).
 * SIN_DEFINIR es un valor más del enum (no se filtra).
 * ============================================================
 */
export class Grafico2ConfigDto {
  // ── Temporal ───────────────────────────────────────────
  @IsDateString()
  fechaDesde!: string;

  @IsDateString()
  fechaHasta!: string;

  // ── Filtros principales ────────────────────────────────
  @IsEnum(TipoViaFiltroFallas)
  tipoVia!: TipoViaFiltroFallas;

  @IsEnum(NivelAnalisis)
  nivel!: NivelAnalisis;

  @IsOptional()
  @IsEnum(TipoFallaFiltro)
  tipoFalla?: TipoFallaFiltro;

  @IsArray() @ArrayNotEmpty()
  @IsInt({ each: true })
  elementoIds!: number[];

  // ── Categoría y modo ───────────────────────────────────
  @IsEnum(CategoriaG2)
  categoria!: CategoriaG2;

  /**
   * Modo de visualización.
   *  - CATEGORIA (default): eje X = opciones del enum.
   *  - ELEMENTO          : eje X = elementos, apilado por enum.
   */
  @IsOptional()
  @IsEnum(ModoG2)
  modo?: ModoG2;

  // ── Avanzados RIEL (acotadores) ────────────────────────
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

  // ── Avanzados SOLDADURA (acotadores) ───────────────────
  @IsOptional()
  @IsArray()
  @IsEnum(AccionFalla, { each: true })
  acciones?: AccionFalla[];

  @IsOptional()
  @IsArray()
  @IsEnum(UbicacionFalla, { each: true })
  ubicacionesFalla?: UbicacionFalla[];
}