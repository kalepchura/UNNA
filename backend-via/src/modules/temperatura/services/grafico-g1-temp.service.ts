import { Injectable, BadRequestException } from '@nestjs/common';
import { TemperaturaAnalyticsRepository } from '../repositories/temperatura-analytics.repository';
import { GraficoG1TempRequestDto } from '../dto/graficos/grafico-1/grafico-1-temp-request.dto';
import {
  GraficoG1TempResponseDto,
  GraficoG1TempSerieDto,
} from '../dto/graficos/grafico-1/grafico-1-temp-response.dto';
import { GraficoG1TempConfigDto } from '../dto/graficos/grafico-1/grafico-1-temp-config.dto';
import { mergeConfig } from '../../../common/helpers/config-merge.helper';
import {
  GranularidadTempG1,
} from '../../../common/enums';

const MESES_ABREV = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

// Configuración base (sin fechaDesde/fechaHasta; DIARIA no se cachea)
const CONFIG_BASE_G1_TEMP: GraficoG1TempConfigDto = {
  granularidad: GranularidadTempG1.MENSUAL, // default más útil
  anio: 2026,
  anioInicio: 2020,
  anioFin: 2026,
  tramoIds: [2, 4],
};

@Injectable()
export class GraficoG1TempService {
  private cacheBase: { data: GraficoG1TempResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(private readonly analyticsRepo: TemperaturaAnalyticsRepository) {}

  async calcular(request: GraficoG1TempRequestDto): Promise<GraficoG1TempResponseDto> {
    // 1. Merge seguro
    const config = mergeConfig(CONFIG_BASE_G1_TEMP, request.config);

    // 2. Validar DIARIA -> obligatorio fechaDesde/fechaHasta
    if (config.granularidad === GranularidadTempG1.DIARIA) {
      if (!config.fechaDesde || !config.fechaHasta) {
        throw new BadRequestException(
          'Para granularidad DIARIA es obligatorio enviar fechaDesde y fechaHasta',
        );
      }
    }

    // 3. Determinar si es configuración base cacheable
    const esConfigBase = this.esConfiguracionBase(config);

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    // 4. Tramo IDs
    const tramoIds = config.tramoIds ?? [];
    if (tramoIds.length === 0) {
      return this.construirRespuestaVacia(config);
    }

    // 5. Rango de fechas
    const { fechaDesde, fechaHasta } = this.calcularRango(config);

    // 6. Consulta a BD
    const filas = await this.analyticsRepo.serieTemporal(
      config.granularidad!,
      tramoIds,
      fechaDesde,
      fechaHasta,
    );

    // 7. Construir respuesta
    const categorias = this.construirCategorias(config);
    const series = this.construirSeries(filas, tramoIds, config, categorias.length);
    const totalRegistros = await this.analyticsRepo.contarRegistrosEnRango(
      tramoIds,
      fechaDesde,
      fechaHasta,
    );

    const respuesta: GraficoG1TempResponseDto = {
      configAplicada: config,
      categorias,
      series,
      metadata: {
        totalRegistros,
        calculadoEn: new Date(),
      },
    };

    // 8. Cache si es base
    if (esConfigBase) {
      this.cacheBase = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  // =============== PRIVATE HELPERS ===============

  private esConfiguracionBase(config: GraficoG1TempConfigDto): boolean {
    const base = CONFIG_BASE_G1_TEMP;
    return (
      config.granularidad === base.granularidad &&
      config.anio === base.anio &&
      config.anioInicio === base.anioInicio &&
      config.anioFin === base.anioFin &&
      JSON.stringify(config.tramoIds) === JSON.stringify(base.tramoIds) &&
      config.fechaDesde === undefined &&
      config.fechaHasta === undefined
    );
  }

  private calcularRango(config: GraficoG1TempConfigDto): { fechaDesde: Date; fechaHasta: Date } {
    if (config.granularidad === GranularidadTempG1.DIARIA) {
      // Siempre llegan con fechas por la validación previa
      return {
        fechaDesde: new Date(config.fechaDesde! + 'T00:00:00'),
        fechaHasta: new Date(config.fechaHasta! + 'T23:59:59.999'),
      };
    }

    if (config.granularidad === GranularidadTempG1.MENSUAL) {
      const anio = config.anio!;
      return {
        fechaDesde: new Date(anio, 0, 1),
        fechaHasta: new Date(anio, 11, 31, 23, 59, 59, 999),
      };
    }

    // ANUAL
    return {
      fechaDesde: new Date(config.anioInicio!, 0, 1),
      fechaHasta: new Date(config.anioFin!, 11, 31, 23, 59, 59, 999),
    };
  }

  private construirCategorias(config: GraficoG1TempConfigDto): string[] {
    if (config.granularidad === GranularidadTempG1.DIARIA) {
      const desde = new Date(config.fechaDesde! + 'T00:00:00');
      const hasta = new Date(config.fechaHasta! + 'T00:00:00');
      const cats: string[] = [];
      const cursor = new Date(desde);
      while (cursor <= hasta) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        cats.push(`${y}-${m}-${d}`);
        cursor.setDate(cursor.getDate() + 1);
      }
      return cats;
    }

    if (config.granularidad === GranularidadTempG1.MENSUAL) {
      return [...MESES_ABREV];
    }

    // ANUAL
    const cats: string[] = [];
    for (let a = config.anioInicio!; a <= config.anioFin!; a++) {
      cats.push(String(a));
    }
    return cats;
  }

  private construirSeries(
    filas: Array<{
      tramoId: number;
      codigo: string;
      nombre: string;
      periodo: number;
      min: number;
      avg: number;
      max: number;
      fecha: string;
    }>,
    tramoIdsSeleccionados: number[],
    config: GraficoG1TempConfigDto,
    cantCategorias: number,
  ): GraficoG1TempSerieDto[] {
    const tramoInfoMap = new Map<number, { codigo: string; nombre: string }>();
    for (const f of filas) {
      if (!tramoInfoMap.has(f.tramoId)) {
        tramoInfoMap.set(f.tramoId, { codigo: f.codigo, nombre: f.nombre });
      }
    }

    const series: GraficoG1TempSerieDto[] = [];
    const indicePorTramo = new Map<number, number>();

    for (const tramoId of tramoIdsSeleccionados) {
      const info = tramoInfoMap.get(tramoId);
      if (info) {
        series.push({
          codigo: info.codigo,
          nombre: info.nombre,
          valores: {
            min: new Array<number | null>(cantCategorias).fill(null),
            avg: new Array<number | null>(cantCategorias).fill(null),
            max: new Array<number | null>(cantCategorias).fill(null),
          },
        });
        indicePorTramo.set(tramoId, series.length - 1);
      }
    }

    for (const fila of filas) {
      const idxSerie = indicePorTramo.get(fila.tramoId);
      if (idxSerie === undefined) continue;

      const idxCat = this.periodoAIndice(fila.periodo, config, fila.fecha);
      if (idxCat >= 0 && idxCat < cantCategorias) {
        const s = series[idxSerie].valores;
        s.min[idxCat] = this.redondear(fila.min);
        s.avg[idxCat] = this.redondear(fila.avg);
        s.max[idxCat] = this.redondear(fila.max);
      }
    }

    return series;
  }

  private periodoAIndice(periodo: number, config: GraficoG1TempConfigDto, fecha?: string): number {
    if (config.granularidad === GranularidadTempG1.DIARIA) {
      // Con rango explícito, calculamos diferencia desde fechaDesde
      const fechaFila = new Date(fecha! + 'T00:00:00');
      const fechaInicio = new Date(config.fechaDesde! + 'T00:00:00');
      const diffTime = fechaFila.getTime() - fechaInicio.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    if (config.granularidad === GranularidadTempG1.MENSUAL) return periodo - 1;
    return periodo - config.anioInicio!;
  }

  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  private construirRespuestaVacia(config: GraficoG1TempConfigDto): GraficoG1TempResponseDto {
    return {
      configAplicada: config,
      categorias: [],
      series: [],
      metadata: { totalRegistros: 0, calculadoEn: new Date() },
    };
  }
}