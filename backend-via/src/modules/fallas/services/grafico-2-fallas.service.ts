import { Injectable } from '@nestjs/common';
import { FallasAnalyticsRepository, FiltrosAnaliticosRiel } from '../repositories/fallas-analytics.repository';
import { Grafico2RequestDto } from '../dto/graficos/grafico-2/grafico-2-request.dto';
import {
  Grafico2ResponseDto,
  Grafico2BarraDto,
} from '../dto/graficos/grafico-2/grafico-2-response.dto';
import {
  CategoriaG2,
  TipoFallaFiltro,
  TipoViaFiltro,
} from '../../../common/enums';

/**
 * Mapeo CATEGORIA → nombre de columna en BD.
 *
 * 🔒 SEGURIDAD CRÍTICA: este objeto es la ÚNICA whitelist de nombres
 * de columnas que el repository puede inyectar en SQL. Los valores
 * son strings literales hard-codeados, NUNCA input del usuario.
 *
 * Cualquier categoría nueva debe agregarse aquí Y en el enum CategoriaG2.
 * Si el frontend manda una categoría sin mapeo válido, el service
 * cae al default ACCION para no crashear.
 *
 * Casos:
 *  - columnaRiel: null  → la categoría no existe en fallas_riel
 *  - columnaSoldadura: null → la categoría no existe en fallas_soldadura_inox
 *  - cv.via             → se requiere acceder al cambiavía (JOIN)
 */
const MAPEO_CATEGORIA: Record<
  CategoriaG2,
  { columnaRiel: string | null; columnaSoldadura: string | null }
> = {
  // ---------- existentes ----------
  [CategoriaG2.ACCION]: {
    columnaRiel: null,
    columnaSoldadura: 'accion',
  },
  [CategoriaG2.CARRIL]: {
    columnaRiel: 'carril',
    columnaSoldadura: null,
  },
  [CategoriaG2.UBICACION_FALLA]: {
    columnaRiel: null,
    columnaSoldadura: 'ubicacion_falla',
  },
  [CategoriaG2.VIA]: {
    columnaRiel: 'via',
    columnaSoldadura: 'cv.via',
  },

  // ---------- FASE 2.D — solo riel ----------
  [CategoriaG2.TIPO_DEFECTO]: {
    columnaRiel: 'tipo_defecto',
    columnaSoldadura: null,
  },
  [CategoriaG2.ELEMENTO_AFECTADO]: {
    columnaRiel: 'elemento_afectado',
    columnaSoldadura: null,
  },
  [CategoriaG2.ZONA_AFECTADA]: {
    columnaRiel: 'zona_afectada',
    columnaSoldadura: null,
  },
  [CategoriaG2.PERFIL]: {
    columnaRiel: 'perfil',
    columnaSoldadura: null,
  },
  [CategoriaG2.ALTA_BAJA]: {
    columnaRiel: 'alta_baja',
    columnaSoldadura: null,
  },
  [CategoriaG2.ESTADO_ACTUAL]: {
    columnaRiel: 'estado_actual',
    columnaSoldadura: null,
  },
  [CategoriaG2.ACCION_ACTUAL_RIEL]: {
    columnaRiel: 'accion_actual',
    columnaSoldadura: null,
  },
};

const CONFIG_BASE_G2 = {
  fechaDesde: '',
  fechaHasta: '',
  tipoFalla: TipoFallaFiltro.AMBAS,
  tipoVia: TipoViaFiltro.AMBAS,
  categoria: CategoriaG2.ACCION,
  tramoIds: [] as number[],
  curvaHorizontalIds: [] as number[],
  curvaVerticalIds: [] as number[],
  tipoDefectos: [] as string[],
  elementosAfectados: [] as string[],
  zonasAfectadas: [] as string[],
  perfiles: [] as string[],
  estadosActuales: [] as string[],
};

@Injectable()
export class Grafico2FallasService {
  private cacheBase: { data: Grafico2ResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(private readonly analyticsRepo: FallasAnalyticsRepository) {}

  async calcular(request: Grafico2RequestDto): Promise<Grafico2ResponseDto> {
    const configLimpia = limpiarUndefined(request.config ?? {});

    const config = {
      fechaDesde: CONFIG_BASE_G2.fechaDesde || this.calcularFechaDefaultDesde(),
      fechaHasta: CONFIG_BASE_G2.fechaHasta || this.calcularFechaDefaultHasta(),
      tipoFalla: CONFIG_BASE_G2.tipoFalla,
      tipoVia: CONFIG_BASE_G2.tipoVia,
      categoria: CONFIG_BASE_G2.categoria,
      tramoIds: CONFIG_BASE_G2.tramoIds,
      curvaHorizontalIds: CONFIG_BASE_G2.curvaHorizontalIds,
      curvaVerticalIds: CONFIG_BASE_G2.curvaVerticalIds,
      tipoDefectos: CONFIG_BASE_G2.tipoDefectos,
      elementosAfectados: CONFIG_BASE_G2.elementosAfectados,
      zonasAfectadas: CONFIG_BASE_G2.zonasAfectadas,
      perfiles: CONFIG_BASE_G2.perfiles,
      estadosActuales: CONFIG_BASE_G2.estadosActuales,
      ...configLimpia,
    };

    // Validar categoría: si vino algo fuera del mapeo, usar default
    if (!MAPEO_CATEGORIA[config.categoria]) {
      config.categoria = CategoriaG2.ACCION;
    }

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

  private esConfiguracionBase(config: any): boolean {
    return (
      config.tipoFalla === CONFIG_BASE_G2.tipoFalla &&
      config.tipoVia === CONFIG_BASE_G2.tipoVia &&
      config.categoria === CONFIG_BASE_G2.categoria &&
      JSON.stringify(config.tramoIds) === JSON.stringify(CONFIG_BASE_G2.tramoIds) &&
      JSON.stringify(config.curvaHorizontalIds) === JSON.stringify(CONFIG_BASE_G2.curvaHorizontalIds) &&
      JSON.stringify(config.curvaVerticalIds) === JSON.stringify(CONFIG_BASE_G2.curvaVerticalIds) &&
      JSON.stringify(config.tipoDefectos) === JSON.stringify(CONFIG_BASE_G2.tipoDefectos) &&
      JSON.stringify(config.elementosAfectados) === JSON.stringify(CONFIG_BASE_G2.elementosAfectados) &&
      JSON.stringify(config.zonasAfectadas) === JSON.stringify(CONFIG_BASE_G2.zonasAfectadas) &&
      JSON.stringify(config.perfiles) === JSON.stringify(CONFIG_BASE_G2.perfiles) &&
      JSON.stringify(config.estadosActuales) === JSON.stringify(CONFIG_BASE_G2.estadosActuales)
    );
  }

  private async calcularDesdeBD(config: any): Promise<Grafico2ResponseDto> {
    const incluirRiel =
      config.tipoFalla === TipoFallaFiltro.RIEL ||
      config.tipoFalla === TipoFallaFiltro.AMBAS;
    const incluirSoldadura =
      config.tipoFalla === TipoFallaFiltro.SOLDADURA ||
      config.tipoFalla === TipoFallaFiltro.AMBAS;

    const viaFiltro =
      config.tipoVia === TipoViaFiltro.AMBAS ? null : config.tipoVia;

    const { columnaRiel, columnaSoldadura } = MAPEO_CATEGORIA[config.categoria];

    const fechaDesde = parsearFechaSegura(
      config.fechaDesde,
      this.calcularFechaDefaultDesde(),
    );
    const fechaHasta = parsearFechaSegura(
      config.fechaHasta,
      this.calcularFechaDefaultHasta(),
      true,
    );

    const filtrosRiel: FiltrosAnaliticosRiel = {
      curvaHorizontalIds: config.curvaHorizontalIds,
      curvaVerticalIds: config.curvaVerticalIds,
      tipoDefectos: config.tipoDefectos,
      elementosAfectados: config.elementosAfectados,
      zonasAfectadas: config.zonasAfectadas,
      perfiles: config.perfiles,
      estadosActuales: config.estadosActuales,
    };

    const filas = await this.analyticsRepo.fallasPorCategoria(
      columnaRiel,
      columnaSoldadura,
      fechaDesde,
      fechaHasta,
      incluirRiel,
      incluirSoldadura,
      viaFiltro,
      config.tramoIds,
      filtrosRiel,
    );

    const barras: Grafico2BarraDto[] = filas.map((f) => ({
      categoria: f.categoria,
      total: f.total,
    }));

    const totalFallas = barras.reduce((acc, b) => acc + b.total, 0);

    return {
      configAplicada: config,
      barras,
      metadata: { totalFallas, calculadoEn: new Date() },
    };
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

function limpiarUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

function parsearFechaSegura(
  fecha: string | undefined,
  fallback: string,
  esFin = false,
): Date {
  const valor = fecha && fecha.length >= 10 ? fecha : fallback;
  const sufijo = esFin ? 'T23:59:59' : 'T00:00:00';
  const d = new Date(`${valor}${sufijo}`);
  if (isNaN(d.getTime())) {
    return new Date(`${fallback}${sufijo}`);
  }
  return d;
}