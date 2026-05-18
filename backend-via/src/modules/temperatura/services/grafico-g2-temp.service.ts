import { Injectable } from '@nestjs/common';
import { TemperaturaAnalyticsRepository } from '../repositories/temperatura-analytics.repository';
import { GraficoG2TempRequestDto } from '../dto/graficos/grafico-2/grafico-2-temp-request.dto';
import {
  GraficoG2TempResponseDto,
  GraficoG2TempBarraDto,
} from '../dto/graficos/grafico-2/grafico-2-temp-response.dto';
import { GraficoG2TempConfigDto } from '../dto/graficos/grafico-2/grafico-2-temp-config.dto';
import { mergeConfig } from '../../../common/helpers/config-merge.helper';

// Configuración base fija
const CONFIG_BASE_G2_TEMP: GraficoG2TempConfigDto = {
  tramoIds: [2, 3, 5],
  fechaDesde: `${new Date().getFullYear()}-01-01`,
  fechaHasta: `${new Date().getFullYear()}-12-31`,
};

@Injectable()
export class GraficoG2TempService {
  private cacheBase: { data: GraficoG2TempResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly analyticsRepo: TemperaturaAnalyticsRepository,
  ) {}

  async calcular(request: GraficoG2TempRequestDto): Promise<GraficoG2TempResponseDto> {
    // 1. Merge seguro
    const config = mergeConfig(CONFIG_BASE_G2_TEMP, request.config);

    // 2. Determinar si es configuración base (para caché)
    const esConfigBase = this.esConfiguracionBase(config);

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    // 3. Obtener IDs de tramo
    const tramoIds = config.tramoIds ?? [];
    if (tramoIds.length === 0) {
      return this.construirRespuestaVacia(config);
    }

    // 4. Rango de fechas
    const fechaDesde = new Date(config.fechaDesde! + 'T00:00:00');
    const fechaHasta = new Date(config.fechaHasta! + 'T23:59:59.999');

    // 5. Consulta a BD (devuelve min, avg, max juntos)
    const filas = await this.analyticsRepo.comparacionEntreTramos(
      tramoIds,
      fechaDesde,
      fechaHasta,
    );

    // 6. Construir barras
    const filaPorTramo = new Map<number, typeof filas[number]>();
    for (const f of filas) filaPorTramo.set(f.tramoId, f);

    const barras: GraficoG2TempBarraDto[] = tramoIds.map((id) => {
      const fila = filaPorTramo.get(id);
      return {
        codigo: fila?.codigo ?? '',
        nombre: fila?.nombre ?? '',
        min: fila ? Math.round(fila.min * 100) / 100 : null,
        avg: fila ? Math.round(fila.avg * 100) / 100 : null,
        max: fila ? Math.round(fila.max * 100) / 100 : null,
        cantidadRegistros: fila?.cantidad ?? 0,
      };
    });

    const totalRegistros = barras.reduce((acc, b) => acc + b.cantidadRegistros, 0);

    const respuesta: GraficoG2TempResponseDto = {
      configAplicada: config,
      barras,
      metadata: {
        totalRegistros,
        calculadoEn: new Date(),
      },
    };

    // 7. Guardar en caché si es base
    if (esConfigBase) {
      this.cacheBase = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  // --------------- helpers privados ---------------

  private esConfiguracionBase(config: GraficoG2TempConfigDto): boolean {
    const base = CONFIG_BASE_G2_TEMP;
    return (
      config.fechaDesde === base.fechaDesde &&
      config.fechaHasta === base.fechaHasta &&
      JSON.stringify(config.tramoIds) === JSON.stringify(base.tramoIds)
    );
  }

  private construirRespuestaVacia(config: GraficoG2TempConfigDto): GraficoG2TempResponseDto {
    return {
      configAplicada: config,
      barras: [],
      metadata: { totalRegistros: 0, calculadoEn: new Date() },
    };
  }
}