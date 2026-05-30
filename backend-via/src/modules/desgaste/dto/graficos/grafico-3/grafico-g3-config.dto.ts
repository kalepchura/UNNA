import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ArrayMinSize,
  ArrayUnique,
} from 'class-validator';
import {
  TipoAgrupacionDesgaste,
  TipoViaFiltro,
  PuntoW,
} from '../../../../../common/enums';

/**
 * Configuración de UNA agrupación dentro del G3.
 *
 * Cambios respecto a la versión anterior:
 *  - tramoId       → tramoIds[]         (múltiples tramos)
 *  - curvaHorizontalId → curvaHorizontalIds[]
 *  - curvaVerticalId   → curvaVerticalIds[]
 *  - escenarioId   → escenarioIds[]     (múltiples escenarios)
 *
 * El service generará automáticamente todas las combinaciones:
 *   elementos × puntosW × escenarios = líneas del gráfico.
 *
 * Nota W: los valores de desgaste pueden ser negativos
 * (corrección de calibración), por eso NO hay validación @Min
 * en los campos W de medición. Aquí solo se validan IDs.
 */
export class GraficoG3ConfigDto {
  @IsOptional()
  @IsEnum(TipoAgrupacionDesgaste)
  tipoAgrupacion?: TipoAgrupacionDesgaste;

  // ── Agrupación por TRAMO ────────────────────────────────────
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  tramoIds?: number[];

  // ── Agrupación por CURVA HORIZONTAL ───────────────────────
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  curvaHorizontalIds?: number[];

  // ── Agrupación por CURVA VERTICAL ─────────────────────────
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  curvaVerticalIds?: number[];

  // ── Filtro de vía ──────────────────────────────────────────
  @IsOptional()
  @IsEnum(TipoViaFiltro)
  via?: TipoViaFiltro;

  // ── Elementos explícitos (override del resolver automático) ─
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  elementoCodigos?: number[];

  // ── Puntos W a graficar ────────────────────────────────────
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(PuntoW, { each: true })
  puntosW?: PuntoW[];

  // ── Escenarios (uno o varios para comparar) ────────────────
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  escenarioIds?: number[];
}