import { Injectable } from '@nestjs/common';
import { FallasAnalyticsRepository } from '../repositories/fallas-analytics.repository';
import { Grafico3RequestDto } from '../dto/graficos/grafico-3/grafico-3-request.dto';
import {
  Grafico3ResponseDto,
  Grafico3SerieDto,
} from '../dto/graficos/grafico-3/grafico-3-response.dto';
import {
  TipoFallaFiltro,
  TipoViaFiltro,
} from '../../../common/enums';
import { VelocidadesService } from '../../catalogos/velocidades/services/velocidades.service';

const CONFIG_BASE_G3 = {
  fechaDesde: '',
  fechaHasta: '',
  tipoFalla: TipoFallaFiltro.AMBAS,
  tipoVia: TipoViaFiltro.AMBAS,
  apilarPorTipo: false,
  tramoIds: [],
};

@Injectable()
export class Grafico3FallasService {
  // Cache para configuración BASE
  private cacheBase: { data: Grafico3ResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly analyticsRepo: FallasAnalyticsRepository,
    private readonly velocidadesService: VelocidadesService,
  ) {}

  async calcular(request: Grafico3RequestDto): Promise<Grafico3ResponseDto> {
    // 🔒 FIX: filtrar undefined del request antes del merge.
    // Si el frontend manda { fechaDesde: undefined }, el spread lo
    // sobrescribiría con undefined pisando el default → crash.
    const configLimpia = limpiarUndefined(request.config ?? {});

    const config = {
      fechaDesde: CONFIG_BASE_G3.fechaDesde || this.calcularFechaDefaultDesde(),
      fechaHasta: CONFIG_BASE_G3.fechaHasta || this.calcularFechaDefaultHasta(),
      tipoFalla: CONFIG_BASE_G3.tipoFalla,
      tipoVia: CONFIG_BASE_G3.tipoVia,
      apilarPorTipo: CONFIG_BASE_G3.apilarPorTipo,
      tramoIds: CONFIG_BASE_G3.tramoIds,
      ...configLimpia,
    };

    const esConfigBase = this.esConfiguracionBase(config);

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }

      const result = await this.calcularDesdeBD(config);
      this.cacheBase = {
        data: result,
        expira: ahora + this.TTL_MS,
      };
      return result;
    }

    return this.calcularDesdeBD(config);
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  private esConfiguracionBase(config: any): boolean {
    return (
      config.tipoFalla === CONFIG_BASE_G3.tipoFalla &&
      config.tipoVia === CONFIG_BASE_G3.tipoVia &&
      config.apilarPorTipo === CONFIG_BASE_G3.apilarPorTipo &&
      JSON.stringify(config.tramoIds) === JSON.stringify(CONFIG_BASE_G3.tramoIds)
    );
  }

  private async calcularDesdeBD(config: any): Promise<Grafico3ResponseDto> {
    const velocidadesCatalogo = await this.velocidadesService.listarParaFiltro();
    velocidadesCatalogo.sort((a, b) => a - b);

    const incluirRiel =
      config.tipoFalla === TipoFallaFiltro.RIEL ||
      config.tipoFalla === TipoFallaFiltro.AMBAS;
    const incluirSoldadura =
      config.tipoFalla === TipoFallaFiltro.SOLDADURA ||
      config.tipoFalla === TipoFallaFiltro.AMBAS;

    const viaFiltro = config.tipoVia === TipoViaFiltro.AMBAS ? null : config.tipoVia;

    // 🔒 Defensa: si las fechas siguen siendo inválidas, usar defaults
    const fechaDesde = parsearFechaSegura(
      config.fechaDesde,
      this.calcularFechaDefaultDesde(),
    );
    const fechaHasta = parsearFechaSegura(
      config.fechaHasta,
      this.calcularFechaDefaultHasta(),
    );

    const filas = await this.analyticsRepo.fallasPorVelocidadYTipo(
      fechaDesde,
      fechaHasta,
      incluirRiel,
      incluirSoldadura,
      viaFiltro,
      config.tramoIds,
    );

    const categorias = velocidadesCatalogo.map((v) => `${v} km/h`);

    const series = config.apilarPorTipo
      ? this.construirSeriesApiladas(filas, velocidadesCatalogo)
      : this.construirSerieUnica(filas, velocidadesCatalogo);

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

  private construirSerieUnica(
    filas: Array<{ velocidad: number; tipo: string; total: number }>,
    velocidades: number[],
  ): Grafico3SerieDto[] {
    const datos = velocidades.map((v) =>
      filas.filter((f) => f.velocidad === v).reduce((acc, f) => acc + f.total, 0)
    );
    return [{ nombre: 'Total', codigo: 'TOTAL', datos }];
  }

  private construirSeriesApiladas(
    filas: Array<{ velocidad: number; tipo: string; total: number }>,
    velocidades: number[],
  ): Grafico3SerieDto[] {
    const getTotal = (v: number, tipo: 'RIEL' | 'SOLDADURA'): number => {
      const fila = filas.find((f) => f.velocidad === v && f.tipo === tipo);
      return fila?.total ?? 0;
    };

    return [
      { nombre: 'Riel', codigo: 'RIEL', datos: velocidades.map((v) => getTotal(v, 'RIEL')) },
      { nombre: 'Soldadura', codigo: 'SOLDADURA', datos: velocidades.map((v) => getTotal(v, 'SOLDADURA')) },
    ];
  }

  private calcularFechaDefaultDesde(): string {
    const hoy = new Date();
    const hace12Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);
    return this.formatearFecha(hace12Meses);
  }

  private calcularFechaDefaultHasta(): string {
    return this.formatearFecha(new Date());
  }

  private formatearFecha(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}

// ============================================================
// HELPERS LOCALES
// ============================================================

/**
 * Quita propiedades undefined de un objeto antes de un spread.
 * Evita que `{ ...defaults, ...{ x: undefined } }` pise el default.
 */
function limpiarUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Convierte un string a Date de forma segura.
 * Si el string es vacío, null o no parsea bien, usa el fallback.
 */
function parsearFechaSegura(valor: string | undefined, fallback: string): Date {
  if (!valor || valor.trim() === '') {
    return new Date(fallback);
  }
  const d = new Date(valor);
  return isNaN(d.getTime()) ? new Date(fallback) : d;
}