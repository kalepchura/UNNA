import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MapaCalorRepository } from '../repositories/mapa-calor.repository';
import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { Cambiavia } from '../../catalogos/cambiavias/entities/cambiavia.entity';
import { CurvaHorizontal } from '../../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../catalogos/curvas-verticales/entities/curva-vertical.entity';

import {
  MapaFallasRequestDto,
  SegmentacionFallas,
} from '../dto/fallas/mapa-fallas-request.dto';
import {
  MapaFallasResponseDto,
  LineaFallasDto,
  ElementoColoreadoFallasDto,
} from '../dto/fallas/mapa-fallas-response.dto';

import { NivelAlertaColor } from '../../../common/enums';
import {
  MAPA_FALLAS,
  FALLAS_RANGO_DEFAULT_MESES,
} from '../../../common/constants/mapa-calor.constants';

@Injectable()
export class MapaFallasService {
  private cache: Map<string, { data: MapaFallasResponseDto; expira: number }> = new Map();
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly mapaRepo: MapaCalorRepository,
    @InjectRepository(Tramo)
    private readonly tramosRepo: Repository<Tramo>,
    @InjectRepository(Cambiavia)
    private readonly cambiaviasRepo: Repository<Cambiavia>,
    @InjectRepository(CurvaHorizontal)
    private readonly curvasHRepo: Repository<CurvaHorizontal>,
    @InjectRepository(CurvaVertical)
    private readonly curvasVRepo: Repository<CurvaVertical>,
  ) {}

  async calcular(request: MapaFallasRequestDto): Promise<MapaFallasResponseDto> {
    const fechaDesde = request.fechaDesde ?? this.haceMesesDefault();
    const fechaHasta = request.fechaHasta ?? this.hoyIso();
    const segmentacion = request.segmentacion ?? SegmentacionFallas.TRAMO;

    const cacheKey = `${segmentacion}|${fechaDesde}|${fechaHasta}`;
    const ahora = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expira > ahora) {
      return cached.data;
    }

    let lineas: LineaFallasDto[];
    switch (segmentacion) {
      case SegmentacionFallas.TRAMO:
        lineas = await this.segmentarPorTramo(fechaDesde, fechaHasta);
        break;
      case SegmentacionFallas.CAMBIAVIA:
        lineas = await this.segmentarPorCambiavia(fechaDesde, fechaHasta);
        break;
      case SegmentacionFallas.CURVA_HORIZONTAL:
        lineas = await this.segmentarPorCurvaHorizontal(fechaDesde, fechaHasta);
        break;
      case SegmentacionFallas.CURVA_VERTICAL:
        lineas = await this.segmentarPorCurvaVertical(fechaDesde, fechaHasta);
        break;
    }

    const todos = lineas.flatMap((l) => l.elementos);
    const elementosConFallas = todos.filter((e) => e.cantidadFallas > 0).length;

    const respuesta: MapaFallasResponseDto = {
      filtrosAplicados: { fechaDesde, fechaHasta, segmentacion },
      lineas,
      metadata: {
        totalElementos: todos.length,
        elementosConFallas,
        elementosSinFallas: todos.length - elementosConFallas,
        calculadoEn: new Date(),
      },
    };

    this.cache.set(cacheKey, { data: respuesta, expira: ahora + this.TTL_MS });
    return respuesta;
  }

  private async segmentarPorTramo(fechaDesde: string, fechaHasta: string): Promise<LineaFallasDto[]> {
    const tramos = await this.tramosRepo.find();
    const conteos = await this.mapaRepo.contarFallasPorTramo(fechaDesde, fechaHasta);
    const mapa = this.indexarPorId(conteos, 'tramoId');

    const elementos: ElementoColoreadoFallasDto[] = tramos
      .map((t) => ({
        codigo: t.codigo,
        nombre: t.nombre,
        progresivaInicio: t.progresivaInicio,
        progresivaFin: t.progresivaFin,
        cantidadFallas: mapa.get(t.id) ?? 0,
        color: this.calcularColor(mapa.get(t.id) ?? 0),
      }))
      .sort((a, b) => a.progresivaInicio - b.progresivaInicio);

    return [{ via: 'BASE', etiqueta: 'Línea principal', elementos }];
  }

  private async segmentarPorCambiavia(fechaDesde: string, fechaHasta: string): Promise<LineaFallasDto[]> {
    const cambiavias = await this.cambiaviasRepo.find();
    const conteos = await this.mapaRepo.contarFallasPorCambiavia(fechaDesde, fechaHasta);
    const mapa = this.indexarPorId(conteos, 'cambiaviaId');

    const elementosTodos: Array<ElementoColoreadoFallasDto & { via: string }> = cambiavias.map((c) => ({
      codigo: c.codigoBd,
      nombre: c.codigoBd,
      progresivaInicio: c.progresiva,
      progresivaFin: c.progresiva,
      cantidadFallas: mapa.get(c.id) ?? 0,
      color: this.calcularColor(mapa.get(c.id) ?? 0),
      via: c.via,
    }));

    const definicion = [
      { via: 'PAR', etiqueta: 'Vía PAR' },
      { via: 'IMPAR', etiqueta: 'Vía IMPAR' },
      { via: 'TERCERA', etiqueta: 'Vía Tercera' },
      { via: 'CERO', etiqueta: 'Vía Cero' },
    ];

    return definicion.map((def) => ({
      via: def.via,
      etiqueta: def.etiqueta,
      elementos: elementosTodos
        .filter((e) => e.via === def.via)
        .sort((a, b) => a.progresivaInicio - b.progresivaInicio)
        .map(({ via, ...resto }) => resto),
    }));
  }

  private async segmentarPorCurvaHorizontal(fechaDesde: string, fechaHasta: string): Promise<LineaFallasDto[]> {
    const curvas = await this.curvasHRepo.find();
    const conteos = await this.mapaRepo.contarFallasPorCurvaHorizontal(fechaDesde, fechaHasta);
    const mapa = this.indexarPorId(conteos, 'curvaId');

    const elementosTodos: Array<ElementoColoreadoFallasDto & { via: string }> = curvas.map((c) => ({
      codigo: c.nombre,
      nombre: `${c.nombre} (radio ${c.radio}m)`,
      progresivaInicio: c.inicioM,
      progresivaFin: c.finM,
      cantidadFallas: mapa.get(c.id) ?? 0,
      color: this.calcularColor(mapa.get(c.id) ?? 0),
      via: c.via,
    }));

    return this.dividirEnDosVias(elementosTodos);
  }

  private async segmentarPorCurvaVertical(fechaDesde: string, fechaHasta: string): Promise<LineaFallasDto[]> {
    const curvas = await this.curvasVRepo.find();
    const conteos = await this.mapaRepo.contarFallasPorCurvaVertical(fechaDesde, fechaHasta);
    const mapa = this.indexarPorId(conteos, 'curvaId');

    const elementosTodos: Array<ElementoColoreadoFallasDto & { via: string }> = curvas.map((c) => ({
      codigo: c.nombre,
      nombre: c.nombre,
      progresivaInicio: c.inicioM,
      progresivaFin: c.finM,
      cantidadFallas: mapa.get(c.id) ?? 0,
      color: this.calcularColor(mapa.get(c.id) ?? 0),
      via: c.via,
    }));

    return this.dividirEnDosVias(elementosTodos);
  }

  private dividirEnDosVias(
    elementos: Array<ElementoColoreadoFallasDto & { via: string }>,
  ): LineaFallasDto[] {
    const definicion = [
      { via: 'PAR', etiqueta: 'Vía PAR' },
      { via: 'IMPAR', etiqueta: 'Vía IMPAR' },
    ];

    return definicion.map((def) => ({
      via: def.via,
      etiqueta: def.etiqueta,
      elementos: elementos
        .filter((e) => e.via === def.via)
        .sort((a, b) => a.progresivaInicio - b.progresivaInicio)
        .map(({ via, ...resto }) => resto),
    }));
  }

  private indexarPorId<K extends string>(
    filas: Array<Record<K, number> & { cantidad: number }>,
    clave: K,
  ): Map<number, number> {
    const map = new Map<number, number>();
    for (const f of filas) {
      map.set(f[clave], f.cantidad);
    }
    return map;
  }

  private calcularColor(cantidad: number): NivelAlertaColor {
    if (cantidad <= MAPA_FALLAS.UMBRAL_VERDE_MAX) return NivelAlertaColor.VERDE;
    if (cantidad <= MAPA_FALLAS.UMBRAL_AMARILLO_MAX) return NivelAlertaColor.AMARILLO;
    return NivelAlertaColor.ROJO;
  }

  private haceMesesDefault(): string {
    const h = new Date();
    h.setMonth(h.getMonth() - FALLAS_RANGO_DEFAULT_MESES);
    return this.toIso(h);
  }

  private hoyIso(): string {
    return this.toIso(new Date());
  }

  private toIso(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}