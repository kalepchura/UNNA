import { IsArray, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { GraficoG3ConfigDto } from './grafico-g3-config.dto';

/**
 * Request del Gráfico 3 — Proyección de Desgaste por Escenario.
 *
 * El usuario puede enviar UNA o VARIAS configuraciones independientes.
 * Cada configuración genera sus propias líneas (elemento × puntoW × escenario).
 * El resultado final es la unión de todas las líneas de todas las configs.
 *
 * Ejemplos de uso:
 *
 * 1) Config simple (un tramo, un escenario):
 *    { configuraciones: [{ tipoAgrupacion: 'TRAMO', tramoIds: [4], ... }] }
 *
 * 2) Comparar dos agrupaciones distintas:
 *    { configuraciones: [
 *        { tipoAgrupacion: 'TRAMO', tramoIds: [4], escenarioIds: [1] },
 *        { tipoAgrupacion: 'CURVA_HORIZONTAL', curvaHorizontalIds: [2,3], escenarioIds: [2] }
 *      ]
 *    }
 *
 * 3) Mismos elementos, distintos escenarios:
 *    { configuraciones: [
 *        { tipoAgrupacion: 'TRAMO', tramoIds: [4], escenarioIds: [1, 2, 3] }
 *      ]
 *    }
 *
 * Si no se envía nada, el service aplica la CONFIG_BASE_G3 por defecto.
 */
export class GraficoG3RequestDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GraficoG3ConfigDto)
  configuraciones?: GraficoG3ConfigDto[];
}