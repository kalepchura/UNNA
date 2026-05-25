import { Injectable } from '@nestjs/common';
import { FallasAnalyticsRepository, FiltrosAnaliticosRiel } from '../repositories/fallas-analytics.repository';
import { Grafico1RequestDto } from '../dto/graficos/grafico-1/grafico-1-request.dto';
import {
  Grafico1ResponseDto,
  Grafico1SerieDto,
} from '../dto/graficos/grafico-1/grafico-1-response.dto';
import { Grafico1ConfigDto } from '../dto/graficos/grafico-1/grafico-1-config.dto';
import {
  GranularidadTemporal,
  TipoFallaFiltro,
  TipoViaFiltro,
} from '../../../common/enums';

const MESES_ABREV = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

// Configuración BASE del sistema (compartida entre todos los usuarios)
const CONFIG_BASE_G1: Required<Grafico1ConfigDto> = {
  granularidad: GranularidadTemporal.MENSUAL,
  anio: new Date().getFullYear(),
  anioInicio: 2020,
  anioFin: new Date().getFullYear(),
  tipoFalla: TipoFallaFiltro.AMBAS,
  tipoVia: TipoViaFiltro.AMBAS,
  tramoIds: [2, 4],
  curvaHorizontalIds: [],
  curvaVerticalIds: [],
  // FASE 2.D — defaults vacíos
  tipoDefectos: [],
  elementosAfectados: [],
  zonasAfectadas: [],
  perfiles: [],
  estadosActuales: [],
};

@Injectable()
export class Grafico1FallasService {
  private cacheBase: { data: Grafico1ResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(private readonly analyticsRepo: FallasAnalyticsRepository) {}

  async calcular(request: Grafico1RequestDto): Promise<Grafico1ResponseDto> {
    const configLimpia = limpiarUndefined(request.config ?? {});

    const config = {
      ...CONFIG_BASE_G1,
      ...configLimpia,
    };

    const esConfigBase = this.esConfiguracionBase(config);

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }

      const result = await this.calcularDesdeBD(config);
      this.cacheBase = { data: result, expira: ahora + this.TTL_MS };
      return result;
    }

    return this.calcularDesdeBD(config);
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  private esConfiguracionBase(config: Required<Grafico1ConfigDto>): boolean {
    return (
      config.granularidad === CONFIG_BASE_G1.granularidad &&
      config.anio === CONFIG_BASE_G1.anio &&
      config.anioInicio === CONFIG_BASE_G1.anioInicio &&
      config.anioFin === CONFIG_BASE_G1.anioFin &&
      config.tipoFalla === CONFIG_BASE_G1.tipoFalla &&
      config.tipoVia === CONFIG_BASE_G1.tipoVia &&
      JSON.stringify(config.tramoIds) === JSON.stringify(CONFIG_BASE_G1.tramoIds) &&
      JSON.stringify(config.curvaHorizontalIds) === JSON.stringify(CONFIG_BASE_G1.curvaHorizontalIds) &&
      JSON.stringify(config.curvaVerticalIds) === JSON.stringify(CONFIG_BASE_G1.curvaVerticalIds) &&
      JSON.stringify(config.tipoDefectos) === JSON.stringify(CONFIG_BASE_G1.tipoDefectos) &&
      JSON.stringify(config.elementosAfectados) === JSON.stringify(CONFIG_BASE_G1.elementosAfectados) &&
      JSON.stringify(config.zonasAfectadas) === JSON.stringify(CONFIG_BASE_G1.zonasAfectadas) &&
      JSON.stringify(config.perfiles) === JSON.stringify(CONFIG_BASE_G1.perfiles) &&
      JSON.stringify(config.estadosActuales) === JSON.stringify(CONFIG_BASE_G1.estadosActuales)
    );
  }

  private async calcularDesdeBD(config: Required<Grafico1ConfigDto>): Promise<Grafico1ResponseDto> {
    const { fechaDesde, fechaHasta } = this.calcularRango(config);

    const incluirRiel =
      config.tipoFalla === TipoFallaFiltro.RIEL ||
      config.tipoFalla === TipoFallaFiltro.AMBAS;
    const incluirSoldadura =
      config.tipoFalla === TipoFallaFiltro.SOLDADURA ||
      config.tipoFalla === TipoFallaFiltro.AMBAS;

    const viaFiltro = config.tipoVia === TipoViaFiltro.AMBAS ? null : config.tipoVia;

    // FASE 2.D — armar objeto de filtros solo-riel
    const filtrosRiel: FiltrosAnaliticosRiel = {
      curvaHorizontalIds: config.curvaHorizontalIds,
      curvaVerticalIds: config.curvaVerticalIds,
      tipoDefectos: config.tipoDefectos,
      elementosAfectados: config.elementosAfectados,
      zonasAfectadas: config.zonasAfectadas,
      perfiles: config.perfiles,
      estadosActuales: config.estadosActuales,
    };

    const filas = await this.analyticsRepo.fallasPorTramoYPeriodo(
      config.granularidad,
      fechaDesde,
      fechaHasta,
      incluirRiel,
      incluirSoldadura,
      viaFiltro,
      config.tramoIds,
      filtrosRiel,
    );

    const categorias = this.construirCategorias(config);
    const series = this.construirSeries(filas, config, categorias.length);
    const totalFallas = filas.reduce((acc, f) => acc + f.total, 0);

    return {
      configAplicada: config,
      categorias,
      series,
      metadata: {
        totalFallas,
        calculadoEn: new Date(),
      },
    };
  }

  private calcularRango(config: Required<Grafico1ConfigDto>): { fechaDesde: Date; fechaHasta: Date } {
    const anio = Number.isInteger(config.anio)
      ? config.anio
      : new Date().getFullYear();

    const anioInicio = Number.isInteger(config.anioInicio)
      ? config.anioInicio
      : 2020;

    const anioFin = Number.isInteger(config.anioFin)
      ? config.anioFin
      : new Date().getFullYear();

    if (config.granularidad === GranularidadTemporal.MENSUAL) {
      return {
        fechaDesde: new Date(anio, 0, 1),
        fechaHasta: new Date(anio, 11, 31, 23, 59, 59),
      };
    }
    return {
      fechaDesde: new Date(anioInicio, 0, 1),
      fechaHasta: new Date(anioFin, 11, 31, 23, 59, 59),
    };
  }

  private construirCategorias(config: Required<Grafico1ConfigDto>): string[] {
    if (config.granularidad === GranularidadTemporal.MENSUAL) {
      return [...MESES_ABREV];
    }
    const cats: string[] = [];
    for (let a = config.anioInicio; a <= config.anioFin; a++) {
      cats.push(String(a));
    }
    return cats;
  }

  private construirSeries(
    filas: Array<{ tramoId: number; codigo: string; nombre: string; periodo: number; total: number }>,
    config: Required<Grafico1ConfigDto>,
    cantCategorias: number,
  ): Grafico1SerieDto[] {
    const seriesMap = new Map<number, { codigo: string; nombre: string; datos: number[] }>();

    for (const fila of filas) {
      if (!seriesMap.has(fila.tramoId)) {
        seriesMap.set(fila.tramoId, {
          codigo: fila.codigo,
          nombre: fila.nombre,
          datos: new Array(cantCategorias).fill(0),
        });
      }
      const serie = seriesMap.get(fila.tramoId)!;
      const indice = this.periodoAIndice(fila.periodo, config);
      if (indice >= 0 && indice < cantCategorias) {
        serie.datos[indice] = fila.total;
      }
    }

    return Array.from(seriesMap.values()).map((s) => ({
      nombre: s.nombre,
      codigo: s.codigo,
      datos: s.datos,
    }));
  }

  private periodoAIndice(periodo: number, config: Required<Grafico1ConfigDto>): number {
    if (config.granularidad === GranularidadTemporal.MENSUAL) {
      return periodo - 1;
    }
    return periodo - config.anioInicio;
  }
}

// ============================================================
// HELPERS LOCALES
// ============================================================

function limpiarUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}