import { Injectable } from '@nestjs/common';
import { TemperaturaAnalyticsRepository } from '../repositories/temperatura-analytics.repository';
import { GraficoG3TempRequestDto } from '../dto/graficos/grafico-3/grafico-3-temp-request.dto';
import {
  GraficoG3TempResponseDto,
  GraficoG3TempSerieDto,
} from '../dto/graficos/grafico-3/grafico-3-temp-response.dto';
import { GraficoG3TempConfigDto } from '../dto/graficos/grafico-3/grafico-3-temp-config.dto';
import { mergeConfig } from '../../../common/helpers/config-merge.helper';

const HORAS_24 = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`
);

// Configuración base: tramos fijos 2 y 4, últimos 30 días
const CONFIG_BASE_G3_TEMP: GraficoG3TempConfigDto = {
  tramoIds: [2, 4],
  // fechaDesde y fechaHasta se calculan dinámicamente en el servicio
};

@Injectable()
export class GraficoG3TempService {
  private cacheBase: { data: GraficoG3TempResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly analyticsRepo: TemperaturaAnalyticsRepository,
  ) {}

  async calcular(request: GraficoG3TempRequestDto): Promise<GraficoG3TempResponseDto> {
    // 1. Merge con defaults (fechas se agregan abajo)
    const config = mergeConfig(CONFIG_BASE_G3_TEMP, request.config);

    // 2. Calcular rango de fechas (default: últimos 30 días)
    const hoy = new Date();
    const fechaHasta = config.fechaHasta ?? this.formatearFecha(hoy);
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    const fechaDesde = config.fechaDesde ?? this.formatearFecha(desde);

    // 3. Determinar si es configuración base (para caché)
    const esConfigBase =
      JSON.stringify(config.tramoIds) === JSON.stringify(CONFIG_BASE_G3_TEMP.tramoIds) &&
      fechaDesde === this.formatearFecha(new Date(new Date().setDate(new Date().getDate() - 30))) &&
      fechaHasta === this.formatearFecha(new Date());

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    // 4. IDs de tramo
    const tramoIds = config.tramoIds ?? [];
    if (tramoIds.length === 0) {
      return this.construirRespuestaVacia(config, fechaDesde, fechaHasta);
    }

    // 5. Query agregada
    const filas = await this.analyticsRepo.patronHorario(
      tramoIds,
      new Date(fechaDesde + 'T00:00:00'),
      new Date(fechaHasta + 'T23:59:59.999'),
    );

    // 6. Construir series (24 horas)
    const tramoInfoMap = new Map<number, { codigo: string; nombre: string }>();
    for (const f of filas) {
      if (!tramoInfoMap.has(f.tramoId)) {
        tramoInfoMap.set(f.tramoId, { codigo: f.codigo, nombre: f.nombre });
      }
    }

    const series: GraficoG3TempSerieDto[] = [];
    const indicePorTramo = new Map<number, number>();

    for (const tramoId of tramoIds) {
      const info = tramoInfoMap.get(tramoId);
      if (info) {
        series.push({
          codigo: info.codigo,
          nombre: info.nombre,
          valores: {
            min: new Array<number | null>(24).fill(null),
            avg: new Array<number | null>(24).fill(null),
            max: new Array<number | null>(24).fill(null),
          },
        });
        indicePorTramo.set(tramoId, series.length - 1);
      }
    }

    let totalRegistros = 0;
    for (const fila of filas) {
      const idxSerie = indicePorTramo.get(fila.tramoId);
      if (idxSerie === undefined) continue;

      const hora = fila.hora; // 0..23
      const s = series[idxSerie].valores;
      s.min[hora] = Math.round(fila.min * 100) / 100;
      s.avg[hora] = Math.round(fila.avg * 100) / 100;
      s.max[hora] = Math.round(fila.max * 100) / 100;
      totalRegistros += fila.cantidad;
    }

    const respuesta: GraficoG3TempResponseDto = {
      configAplicada: {
        ...config,
        fechaDesde,
        fechaHasta,
      },
      categorias: HORAS_24,
      series,
      metadata: {
        totalRegistros,
        calculadoEn: new Date(),
      },
    };

    if (esConfigBase) {
      this.cacheBase = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  private formatearFecha(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private construirRespuestaVacia(
    config: GraficoG3TempConfigDto,
    fechaDesde: string,
    fechaHasta: string,
  ): GraficoG3TempResponseDto {
    return {
      configAplicada: { ...config, fechaDesde, fechaHasta },
      categorias: HORAS_24,
      series: [],
      metadata: { totalRegistros: 0, calculadoEn: new Date() },
    };
  }
}