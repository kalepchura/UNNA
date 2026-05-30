// backend/src/modules/fallas/services/grafico-2-fallas.service.ts

import { Injectable } from '@nestjs/common';
import { FallasAnalyticsRepository } from '../repositories/fallas-analytics.repository';
import { Grafico2RequestDto } from '../dto/graficos/grafico-2/grafico-2-request.dto';
import {
  Grafico2ResponseDto,
  Grafico2SerieDto,
} from '../dto/graficos/grafico-2/grafico-2-response.dto';
import { Grafico2ConfigDto } from '../dto/graficos/grafico-2/grafico-2-config.dto';
import { CategoriaG2 } from '../../../common/enums';
import { ModoG2 } from '../enums/fallas-graficos.enums';
import {
  validarConfigBase,
  resolverTipoFalla,
  resolverViaFiltro,
  columnasPorNivel,
} from '../helpers/graficos.helper';

/**
 * Mapeo CATEGORÍA → columna en cada tabla.
 *  - columnaRiel: null      → la categoría no existe en fallas_riel.
 *  - columnaSoldadura: null → la categoría no existe en fallas_soldadura_inox.
 *  - prefijo 'cv.'          → se requiere JOIN con cambiavía.
 *
 * 🔒 SEGURIDAD: whitelist única de columnas SQL.
 */
const MAPEO_CATEGORIA: Record<
  CategoriaG2,
  { columnaRiel: string | null; columnaSoldadura: string | null }
> = {
  [CategoriaG2.ACCION]:             { columnaRiel: null,                columnaSoldadura: 'accion' },
  [CategoriaG2.CARRIL]:             { columnaRiel: 'carril',            columnaSoldadura: null },
  [CategoriaG2.UBICACION_FALLA]:    { columnaRiel: null,                columnaSoldadura: 'ubicacion_falla' },
  [CategoriaG2.VIA]:                { columnaRiel: 'via',               columnaSoldadura: 'cv.via' },
  [CategoriaG2.TIPO_DEFECTO]:       { columnaRiel: 'tipo_defecto',      columnaSoldadura: null },
  [CategoriaG2.ELEMENTO_AFECTADO]:  { columnaRiel: 'elemento_afectado', columnaSoldadura: null },
  [CategoriaG2.ZONA_AFECTADA]:      { columnaRiel: 'zona_afectada',     columnaSoldadura: null },
  [CategoriaG2.PERFIL]:             { columnaRiel: 'perfil',            columnaSoldadura: null },
  [CategoriaG2.ALTA_BAJA]:          { columnaRiel: 'alta_baja',         columnaSoldadura: null },
  [CategoriaG2.ESTADO_ACTUAL]:      { columnaRiel: 'estado_actual',     columnaSoldadura: null },
  [CategoriaG2.ACCION_ACTUAL_RIEL]: { columnaRiel: 'accion_actual',     columnaSoldadura: null },
};

@Injectable()
export class Grafico2FallasService {
  constructor(private readonly analyticsRepo: FallasAnalyticsRepository) {}

  async calcular(request: Grafico2RequestDto): Promise<Grafico2ResponseDto> {
    const config = request.config;

    if (!config) {
      return this.respuestaVacia([], 'Configura los filtros y pulsa Aplicar.');
    }

    // Validar comunes
    const v = validarConfigBase(config);
    if (!v.ok) {
      return this.respuestaVacia([], v.mensaje, config.nivel, config.modo);
    }

    // Validar fechas
    if (!config.fechaDesde || !config.fechaHasta) {
      return this.respuestaVacia([], 'Especifica fecha desde y fecha hasta.', config.nivel, config.modo);
    }

    // Validar categoría
    if (!MAPEO_CATEGORIA[config.categoria]) {
      return this.respuestaVacia([], 'Categoría inválida.', config.nivel, config.modo);
    }

    return this.calcularDesdeBD(config);
  }

  // ----------------------------------------------------------
  // Cálculo principal
  // ----------------------------------------------------------
  private async calcularDesdeBD(config: Grafico2ConfigDto): Promise<Grafico2ResponseDto> {
    const modo = config.modo ?? ModoG2.CATEGORIA;
    const { incluirRiel, incluirSoldadura } = resolverTipoFalla(config.nivel, config.tipoFalla);
    const viaFiltro = resolverViaFiltro(config.tipoVia);
    const cols = columnasPorNivel(config.nivel);
    const { columnaRiel: colCatRiel, columnaSoldadura: colCatSold } = MAPEO_CATEGORIA[config.categoria];

    const fechaDesde = this.parsearFecha(config.fechaDesde, false);
    const fechaHasta = this.parsearFecha(config.fechaHasta, true);

    // Avanzados: armamos los pedazos de SQL y los params extra.
    const paramsExtra: any[] = [];
    const avanzadosRiel = this.construirAvanzadosRiel(config, paramsExtra);
    const avanzadosSoldadura = this.construirAvanzadosSoldadura(config, paramsExtra);

    if (modo === ModoG2.CATEGORIA) {
      const filas = await this.analyticsRepo.fallasG2PorCategoria({
        columnaCategoriaRiel: colCatRiel,
        columnaCategoriaSoldadura: colCatSold,
        fechaDesde, fechaHasta,
        incluirRiel, incluirSoldadura,
        viaFiltro,
        elementoIds: config.elementoIds,
        cols,
        avanzadosRiel, avanzadosSoldadura, paramsExtra,
      });

      const categorias = filas.map((f) => f.categoria);
      const series: Grafico2SerieDto[] = [{
        nombre: 'Total',
        codigo: 'TOTAL',
        datos: filas.map((f) => f.total),
      }];
      const totalFallas = filas.reduce((acc, f) => acc + f.total, 0);

      return {
        categorias,
        series,
        metadata: { totalFallas, calculadoEn: new Date(), nivel: config.nivel, modo },
      };
    }

    // Modo ELEMENTO: eje X = elementos, series apiladas por opción del enum.
    const filas = await this.analyticsRepo.fallasG2PorElemento({
      columnaCategoriaRiel: colCatRiel,
      columnaCategoriaSoldadura: colCatSold,
      fechaDesde, fechaHasta,
      incluirRiel, incluirSoldadura,
      viaFiltro,
      elementoIds: config.elementoIds,
      cols,
      avanzadosRiel, avanzadosSoldadura, paramsExtra,
    });

    // Construir el reparto.
    // 1) Lista única de elementos (orden alfabético por nombre).
    const elementosMap = new Map<number, { nombre: string; codigo: string }>();
    for (const f of filas) {
      if (!elementosMap.has(f.elementoId)) {
        elementosMap.set(f.elementoId, { nombre: f.nombre, codigo: f.codigo });
      }
    }
    const elementosOrdenados = Array.from(elementosMap.entries())
      .sort((a, b) => a[1].nombre.localeCompare(b[1].nombre));

    const categorias = elementosOrdenados.map(([, e]) => e.nombre);
    const indicePorElemento = new Map<number, number>();
    elementosOrdenados.forEach(([id], idx) => indicePorElemento.set(id, idx));

    // 2) Lista única de opciones del enum (orden alfabético).
    const opcionesSet = new Set<string>();
    for (const f of filas) opcionesSet.add(f.categoria);
    const opciones = Array.from(opcionesSet).sort();

    // 3) Una serie por opción del enum, con un valor por cada elemento.
    const series: Grafico2SerieDto[] = opciones.map((opcion) => ({
      nombre: opcion,
      codigo: opcion,
      datos: new Array(elementosOrdenados.length).fill(0),
    }));
    const indicePorOpcion = new Map<string, number>();
    opciones.forEach((op, idx) => indicePorOpcion.set(op, idx));

    for (const f of filas) {
      const idxEl = indicePorElemento.get(f.elementoId)!;
      const idxOp = indicePorOpcion.get(f.categoria)!;
      series[idxOp].datos[idxEl] = f.total;
    }

    const totalFallas = filas.reduce((acc, f) => acc + f.total, 0);
    return {
      categorias,
      series,
      metadata: { totalFallas, calculadoEn: new Date(), nivel: config.nivel, modo },
    };
  }

  // ----------------------------------------------------------
  // Avanzados
  // ----------------------------------------------------------
  private construirAvanzadosRiel(config: Grafico2ConfigDto, params: any[]): string {
    const partes: string[] = [
      this.analyticsRepo.construirInEnum(config.tipoDefectos,       params, 'f.tipo_defecto'),
      this.analyticsRepo.construirInEnum(config.elementosAfectados, params, 'f.elemento_afectado'),
      this.analyticsRepo.construirInEnum(config.zonasAfectadas,     params, 'f.zona_afectada'),
      this.analyticsRepo.construirInEnum(config.perfiles,           params, 'f.perfil'),
      this.analyticsRepo.construirInEnum(config.estadosActuales,    params, 'f.estado_actual'),
    ];
    return partes.filter((p) => p.length > 0).join(' ');
  }

  private construirAvanzadosSoldadura(config: Grafico2ConfigDto, params: any[]): string {
    const partes: string[] = [
      this.analyticsRepo.construirInEnum(config.acciones,         params, 'f.accion'),
      this.analyticsRepo.construirInEnum(config.ubicacionesFalla, params, 'f.ubicacion_falla'),
    ];
    return partes.filter((p) => p.length > 0).join(' ');
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  private parsearFecha(fecha: string, esFin: boolean): Date {
    const sufijo = esFin ? 'T23:59:59' : 'T00:00:00';
    const d = new Date(`${fecha}${sufijo}`);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private respuestaVacia(
    categorias: string[],
    mensaje: string,
    nivel?: Grafico2ConfigDto['nivel'],
    modo?: ModoG2,
  ): Grafico2ResponseDto {
    return {
      categorias,
      series: [],
      metadata: { totalFallas: 0, calculadoEn: new Date(), nivel, modo, mensaje },
    };
  }
}