import { Grafico1ConfigDto } from './grafico-1-config.dto';

/**
 * Una serie del gráfico = una línea = un tramo.
 */
export class Grafico1SerieDto {
  /** Nombre legible del tramo (para mostrar en leyenda). */
  nombre!: string;

  /** Código del tramo (para identificar). */
  codigo!: string;

  /**
   * Valores numéricos en cada categoría del eje X.
   * Tiene la misma longitud que `categorias` del response.
   * Los meses/años sin fallas se rellenan con 0.
   */
  datos!: number[];
}

/**
 * Metadatos del cálculo para mostrar/debug.
 */
export class Grafico1MetadataDto {
  totalFallas!: number;
  calculadoEn!: Date;
}

/**
 * RESPONSE DTO del Gráfico 1.
 */
export class Grafico1ResponseDto {
  /**
   * Config efectivamente aplicada (default + lo que envió el cliente).
   * Útil para que el frontend rellene los selects con la config usada.
   */
  configAplicada!: Required<Grafico1ConfigDto>;

  /**
   * Etiquetas del eje X.
   * Si MENSUAL: ['Ene','Feb',...,'Dic']
   * Si ANUAL: ['2020','2021',...,'2026']
   */
  categorias!: string[];

  series!: Grafico1SerieDto[];

  metadata!: Grafico1MetadataDto;
}