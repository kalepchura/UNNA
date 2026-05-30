// backend/src/modules/fallas/services/grafico-1-fallas.service.ts

import { Injectable } from '@nestjs/common';
import { FallasAnalyticsRepository } from '../repositories/fallas-analytics.repository';
import { Grafico1RequestDto } from '../dto/graficos/grafico-1/grafico-1-request.dto';
import {
  Grafico1ResponseDto,
  Grafico1SerieDto,
} from '../dto/graficos/grafico-1/grafico-1-response.dto';
import { Grafico1ConfigDto } from '../dto/graficos/grafico-1/grafico-1-config.dto';
import { GranularidadTemporal } from '../../../common/enums';
import {
  validarConfigBase,
  resolverTipoFalla,
  resolverViaFiltro,
  columnasPorNivel,
} from '../helpers/graficos.helper';

const MESES_ABREV = [
  'Ene','Feb','Mar','Abr','May','Jun',
  'Jul','Ago','Sep','Oct','Nov','Dic',
];

/**
 * ============================================================
 * G1 — Evolución temporal
 * ============================================================
 * Sin defaults. Sin caché. Sin merge.
 * Recibe → valida → ejecuta UNA query por nivel → responde.
 * Si la config no es válida, responde gráfico vacío con mensaje.
 * ============================================================
 */
@Injectable()
export class Grafico1FallasService {
  constructor(private readonly analyticsRepo: FallasAnalyticsRepository) {}

  async calcular(request: Grafico1RequestDto): Promise<Grafico1ResponseDto> {
    const config = request.config;

    // 1) ¿Llegó config?
    if (!config) {
      return this.respuestaVacia([], 'Configura los filtros y pulsa Aplicar.');
    }

    // 2) Validar campos base (nivel, elementos, vía vs nivel, tipoFalla vs nivel).
    const v = validarConfigBase(config);
    if (!v.ok) {
      return this.respuestaVacia(this.construirCategorias(config), v.mensaje, config.nivel);
    }

    // 3) Validar campos temporales específicos de G1.
    const errTemp = this.validarTemporal(config);
    if (errTemp) {
      return this.respuestaVacia(this.construirCategorias(config), errTemp, config.nivel);
    }

    // 4) Ejecutar.
    return this.calcularDesdeBD(config);
  }

  // ----------------------------------------------------------
  // Validación temporal específica
  // ----------------------------------------------------------
  private validarTemporal(config: Grafico1ConfigDto): string | null {
    if (config.granularidad === GranularidadTemporal.MENSUAL) {
      if (!Number.isInteger(config.anio)) {
        return 'Para granularidad MENSUAL, especifica un año.';
      }
    } else {
      if (!Number.isInteger(config.anioInicio) || !Number.isInteger(config.anioFin)) {
        return 'Para granularidad ANUAL, especifica año inicio y año fin.';
      }
      if ((config.anioInicio as number) > (config.anioFin as number)) {
        return 'El año inicio no puede ser mayor que el año fin.';
      }
    }
    return null;
  }

  // ----------------------------------------------------------
  // Cálculo principal
  // ----------------------------------------------------------
  private async calcularDesdeBD(
    config: Grafico1ConfigDto,
  ): Promise<Grafico1ResponseDto> {
    const { fechaDesde, fechaHasta } = this.calcularRango(config);
    const categorias = this.construirCategorias(config);
    const cantCategorias = categorias.length;

    const { incluirRiel, incluirSoldadura } = resolverTipoFalla(config.nivel, config.tipoFalla);
    const viaFiltro = resolverViaFiltro(config.tipoVia);
    const cols = columnasPorNivel(config.nivel);

    // Si por el nivel no hay tablas que aportan (caso imposible tras validación,
    // pero defensivo) → vacío.
    if (!incluirRiel && !incluirSoldadura) {
      return this.respuestaVacia(categorias, 'Sin tablas que aporten datos a este nivel.', config.nivel);
    }

    const filas = await this.analyticsRepo.fallasG1({
      granularidad: config.granularidad,
      fechaDesde,
      fechaHasta,
      incluirRiel,
      incluirSoldadura,
      viaFiltro,
      elementoIds: config.elementoIds,
      cols,
    });

    // Armar series: una por elementoId.
    const series = this.armarSeries(filas, config, cantCategorias);
    const totalFallas = series.reduce(
      (acc, s) => acc + s.datos.reduce((sum, n) => sum + n, 0),
      0,
    );

    return {
      categorias,
      series,
      metadata: { totalFallas, calculadoEn: new Date(), nivel: config.nivel },
    };
  }

  // ----------------------------------------------------------
  // Helpers privados
  // ----------------------------------------------------------
  private respuestaVacia(
    categorias: string[],
    mensaje: string,
    nivel?: Grafico1ConfigDto['nivel'],
  ): Grafico1ResponseDto {
    return {
      categorias,
      series: [],
      metadata: { totalFallas: 0, calculadoEn: new Date(), nivel, mensaje },
    };
  }

  private calcularRango(config: Grafico1ConfigDto): { fechaDesde: Date; fechaHasta: Date } {
    if (config.granularidad === GranularidadTemporal.MENSUAL) {
      const anio = config.anio as number;
      return {
        fechaDesde: new Date(anio, 0, 1),
        fechaHasta: new Date(anio, 11, 31, 23, 59, 59),
      };
    }
    return {
      fechaDesde: new Date(config.anioInicio as number, 0, 1),
      fechaHasta: new Date(config.anioFin as number, 11, 31, 23, 59, 59),
    };
  }

  private construirCategorias(config: Grafico1ConfigDto): string[] {
    if (!config.granularidad) return [];
    if (config.granularidad === GranularidadTemporal.MENSUAL) {
      return [...MESES_ABREV];
    }
    const cats: string[] = [];
    const inicio = config.anioInicio ?? new Date().getFullYear();
    const fin    = config.anioFin    ?? new Date().getFullYear();
    for (let a = inicio; a <= fin; a++) cats.push(String(a));
    return cats;
  }

  private periodoAIndice(periodo: number, config: Grafico1ConfigDto): number {
    if (config.granularidad === GranularidadTemporal.MENSUAL) {
      return periodo - 1;
    }
    return periodo - (config.anioInicio as number);
  }

  private armarSeries(
    filas: Array<{ elementoId: number; nombre: string; codigo: string; periodo: number; total: number }>,
    config: Grafico1ConfigDto,
    cantCategorias: number,
  ): Grafico1SerieDto[] {
    const seriesMap = new Map<number, Grafico1SerieDto>();

    for (const fila of filas) {
      let serie = seriesMap.get(fila.elementoId);
      if (!serie) {
        serie = {
          nombre: fila.nombre,
          codigo: fila.codigo,
          elementoId: fila.elementoId,
          datos: new Array(cantCategorias).fill(0),
        };
        seriesMap.set(fila.elementoId, serie);
      }
      const idx = this.periodoAIndice(fila.periodo, config);
      if (idx >= 0 && idx < cantCategorias) {
        serie.datos[idx] = fila.total;
      }
    }

    // Solo devolvemos series con al menos un valor > 0.
    return Array.from(seriesMap.values()).filter(
      (s) => s.datos.some((n) => n > 0),
    );
  }
}