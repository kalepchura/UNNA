import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MapaCalorRepository } from '../repositories/mapa-calor.repository';
import { EscenariosMtbRepository } from '../../desgaste/repositories/escenarios-mtb.repository';
import { ElementoDesgaste } from '../../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';

import { MapaDesgasteGeneralRequestDto } from '../dto/desgaste/mapa-desgaste-general-request.dto';
import {
  MapaDesgasteGeneralResponseDto,
  LineaDesgasteDto,
  PuntoColoreadoDesgasteDto,
} from '../dto/desgaste/mapa-desgaste-general-response.dto';
import { MapaDesgasteIndiceRequestDto } from '../dto/desgaste/mapa-desgaste-indice-request.dto';
import {
  MapaDesgasteIndiceResponseDto,
  LineaDesgasteIndiceDto,
  PuntoColoreadoIndiceDto,
} from '../dto/desgaste/mapa-desgaste-indice-response.dto';

import { NivelAlertaColor, PuntoW } from '../../../common/enums';
import {
  MAPA_DESGASTE_GENERAL,
  MAPA_DESGASTE_INDICE,
} from '../../../common/constants/mapa-calor.constants';
import { ESCENARIO_REAL_NOMBRE } from '../../../common/constants/desgaste.constants';

@Injectable()
export class MapaDesgasteService {
  private cacheGeneral: { data: MapaDesgasteGeneralResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private cacheIndice: { data: MapaDesgasteIndiceResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  /** Cache del ID del escenario REAL para no buscarlo en cada request. */
  private idEscenarioReal: number | null = null;

  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly mapaRepo: MapaCalorRepository,
    private readonly escenariosRepo: EscenariosMtbRepository,
    @InjectRepository(ElementoDesgaste)
    private readonly elementosRepo: Repository<ElementoDesgaste>,
  ) {}

  // ----------------------------------------------------------
  // MODO GENERAL
  // ----------------------------------------------------------

  async calcularModoGeneral(
    request: MapaDesgasteGeneralRequestDto,
  ): Promise<MapaDesgasteGeneralResponseDto> {
    // Si no se especifica escenario, usar el REAL resuelto por nombre
    const escenarioId = request.escenarioId ?? await this.resolverIdEscenarioReal();
    const puntoW = request.puntoW ?? PuntoW.W1;
    const fechaCorte = request.fechaCorte ?? this.hoyIso();

    const esBase = !request.escenarioId && !request.puntoW && !request.fechaCorte;
    if (esBase) {
      const ahora = Date.now();
      if (this.cacheGeneral.data && this.cacheGeneral.expira > ahora) {
        return this.cacheGeneral.data;
      }
    }

    await this.validarEscenario(escenarioId);

    const elementos = await this.elementosRepo.find({
      order: { progresiva: 'ASC' },
    });

    const columnaW = this.puntoToColumn(puntoW);
    const filas = await this.mapaRepo.ultimaMedicionPorElemento(columnaW, fechaCorte);

    const datosPorElemento = new Map<number, { valor: number; anio: number; trimestre: number }>();
    for (const f of filas) {
      datosPorElemento.set(f.elementoId, { valor: f.valor, anio: f.anio, trimestre: f.trimestre });
    }

    const puntosColoreados: Array<PuntoColoreadoDesgasteDto & { via: string; riel: string }> =
      elementos.map((e) => {
        const dato = datosPorElemento.get(e.id);
        const valorMm = dato ? this.redondear2(dato.valor) : null;
        const color = this.calcularColorGeneral(valorMm);
        return {
          codigoElemento: e.codigoElemento,
          progresiva: e.progresiva,
          valorMm,
          color,
          anio: dato?.anio ?? null,
          trimestre: dato?.trimestre ?? null,
          via: e.via,
          riel: e.riel,
        };
      });

    const lineas = this.agruparEn4LineasGeneral(puntosColoreados);
    const elementosConDatos = puntosColoreados.filter((p) => p.valorMm !== null).length;

    const respuesta: MapaDesgasteGeneralResponseDto = {
      filtrosAplicados: { escenarioId, puntoW, fechaCorte },
      lineas,
      metadata: {
        totalElementos: elementos.length,
        elementosConDatos,
        elementosSinDatos: elementos.length - elementosConDatos,
        calculadoEn: new Date(),
      },
    };

    if (esBase) {
      this.cacheGeneral = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  // ----------------------------------------------------------
  // MODO ÍNDICE
  // ----------------------------------------------------------

  async calcularModoPorIndice(
    request: MapaDesgasteIndiceRequestDto,
  ): Promise<MapaDesgasteIndiceResponseDto> {
    // Si no se especifica escenario, usar el REAL resuelto por nombre
    const idReal = await this.resolverIdEscenarioReal();
    const escenarioIdA = request.escenarioIdA ?? idReal;
    const escenarioIdB = request.escenarioIdB ?? idReal;
    const puntoWA = request.puntoWA ?? PuntoW.W1;
    const puntoWB = request.puntoWB ?? PuntoW.W2;
    const fechaCorte = request.fechaCorte ?? this.hoyIso();

    const esBase =
      !request.escenarioIdA &&
      !request.escenarioIdB &&
      !request.puntoWA &&
      !request.puntoWB &&
      !request.fechaCorte;
    if (esBase) {
      const ahora = Date.now();
      if (this.cacheIndice.data && this.cacheIndice.expira > ahora) {
        return this.cacheIndice.data;
      }
    }

    await this.validarEscenario(escenarioIdA);
    if (escenarioIdB !== escenarioIdA) {
      await this.validarEscenario(escenarioIdB);
    }

    const elementos = await this.elementosRepo.find({
      order: { progresiva: 'ASC' },
    });

    const columnaA = this.puntoToColumn(puntoWA);
    const columnaB = this.puntoToColumn(puntoWB);

    const [filasA, filasB] = await Promise.all([
      this.mapaRepo.ultimaMedicionPorElemento(columnaA, fechaCorte),
      this.mapaRepo.ultimaMedicionPorElemento(columnaB, fechaCorte),
    ]);

    const datosA = this.indexarPorElemento(filasA);
    const datosB = this.indexarPorElemento(filasB);

    const puntosColoreados: Array<PuntoColoreadoIndiceDto & { via: string; riel: string }> =
      elementos.map((e) => {
        const a = datosA.get(e.id);
        const b = datosB.get(e.id);

        const valorA = a ? this.redondear2(a.valor) : null;
        const valorB = b ? this.redondear2(b.valor) : null;

        const indice = this.calcularIndice(valorA, valorB);
        const color = this.calcularColorIndice(indice);

        return {
          codigoElemento: e.codigoElemento,
          progresiva: e.progresiva,
          valorA,
          valorB,
          indice,
          color,
          anioA: a?.anio ?? null,
          trimestreA: a?.trimestre ?? null,
          anioB: b?.anio ?? null,
          trimestreB: b?.trimestre ?? null,
          via: e.via,
          riel: e.riel,
        };
      });

    const lineas = this.agruparEn4LineasIndice(puntosColoreados);
    const elementosConIndice = puntosColoreados.filter((p) => p.indice !== null).length;

    const respuesta: MapaDesgasteIndiceResponseDto = {
      filtrosAplicados: {
        escenarioIdA,
        puntoWA,
        escenarioIdB,
        puntoWB,
        fechaCorte,
      },
      lineas,
      metadata: {
        totalElementos: elementos.length,
        elementosConIndice,
        elementosSinDatos: elementos.length - elementosConIndice,
        calculadoEn: new Date(),
      },
    };

    if (esBase) {
      this.cacheIndice = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  // ----------------------------------------------------------
  // RESOLVER ID DEL ESCENARIO REAL (por nombre, no por ID fijo)
  // ----------------------------------------------------------

  /**
   * Busca el escenario con nombre = ESCENARIO_REAL_NOMBRE ('REAL').
   * Cachea el resultado en memoria para no hacer la query en cada request.
   * Lanza BadRequestException si no existe — el sistema requiere el escenario REAL.
   */
  private async resolverIdEscenarioReal(): Promise<number> {
    if (this.idEscenarioReal !== null) return this.idEscenarioReal;

    const escenario = await this.escenariosRepo.buscarPorNombre(ESCENARIO_REAL_NOMBRE);
    if (!escenario || escenario.eliminado) {
      throw new BadRequestException(
        `El escenario '${ESCENARIO_REAL_NOMBRE}' no existe o está eliminado. ` +
        `Es requerido para el mapa de calor de desgaste.`,
      );
    }

    this.idEscenarioReal = escenario.id;
    return escenario.id;
  }

  /** Llamar cuando se modifica el escenario REAL (renombre, restauración). */
  invalidarCacheEscenarioReal(): void {
    this.idEscenarioReal = null;
    this.cacheGeneral = { data: null, expira: 0 };
    this.cacheIndice  = { data: null, expira: 0 };
  }

  // ----------------------------------------------------------
  // HELPERS PRIVADOS
  // ----------------------------------------------------------

  private async validarEscenario(escenarioId: number): Promise<void> {
    const esc = await this.escenariosRepo.buscarPorId(escenarioId);
    if (!esc) {
      throw new NotFoundException(`Escenario con ID ${escenarioId} no encontrado`);
    }
    if (esc.eliminado) {
      throw new BadRequestException(
        `Escenario con ID ${escenarioId} está eliminado y no se puede usar`,
      );
    }
  }

  private indexarPorElemento(
    filas: Array<{ elementoId: number; valor: number; anio: number; trimestre: number }>,
  ): Map<number, { valor: number; anio: number; trimestre: number }> {
    const map = new Map<number, { valor: number; anio: number; trimestre: number }>();
    for (const f of filas) {
      map.set(f.elementoId, { valor: f.valor, anio: f.anio, trimestre: f.trimestre });
    }
    return map;
  }

  private calcularIndice(valorA: number | null, valorB: number | null): number | null {
    if (valorA === null || valorB === null) return null;
    if (valorB === 0) return null;
    return Math.round((valorA / valorB) * 1000) / 1000;
  }

  private agruparEn4LineasGeneral(
    puntos: Array<PuntoColoreadoDesgasteDto & { via: string; riel: string }>,
  ): LineaDesgasteDto[] {
    const definicion = this.definicionLineas();
    return definicion.map((def) => ({
      via: def.via,
      riel: def.riel,
      etiqueta: def.etiqueta,
      puntos: puntos
        .filter((p) => p.via === def.via && p.riel === def.riel)
        .sort((a, b) => a.progresiva - b.progresiva)
        .map((p) => ({
          codigoElemento: p.codigoElemento,
          progresiva: p.progresiva,
          valorMm: p.valorMm,
          color: p.color,
          anio: p.anio,
          trimestre: p.trimestre,
        })),
    }));
  }

  private agruparEn4LineasIndice(
    puntos: Array<PuntoColoreadoIndiceDto & { via: string; riel: string }>,
  ): LineaDesgasteIndiceDto[] {
    const definicion = this.definicionLineas();
    return definicion.map((def) => ({
      via: def.via,
      riel: def.riel,
      etiqueta: def.etiqueta,
      puntos: puntos
        .filter((p) => p.via === def.via && p.riel === def.riel)
        .sort((a, b) => a.progresiva - b.progresiva)
        .map((p) => ({
          codigoElemento: p.codigoElemento,
          progresiva: p.progresiva,
          valorA: p.valorA,
          valorB: p.valorB,
          indice: p.indice,
          color: p.color,
          anioA: p.anioA,
          trimestreA: p.trimestreA,
          anioB: p.anioB,
          trimestreB: p.trimestreB,
        })),
    }));
  }

  private definicionLineas() {
    return [
      { via: 'PAR',   riel: 'IZQUIERDA', etiqueta: 'Via PAR - Carril Izquierdo' },
      { via: 'PAR',   riel: 'DERECHA',   etiqueta: 'Via PAR - Carril Derecho' },
      { via: 'IMPAR', riel: 'IZQUIERDA', etiqueta: 'Via IMPAR - Carril Izquierdo' },
      { via: 'IMPAR', riel: 'DERECHA',   etiqueta: 'Via IMPAR - Carril Derecho' },
    ];
  }

  private calcularColorGeneral(valor: number | null): NivelAlertaColor {
    if (valor === null) return NivelAlertaColor.GRIS;
    if (valor < MAPA_DESGASTE_GENERAL.UMBRAL_VERDE_MAX) return NivelAlertaColor.VERDE;
    if (valor <= MAPA_DESGASTE_GENERAL.UMBRAL_AMARILLO_MAX) return NivelAlertaColor.AMARILLO;
    return NivelAlertaColor.ROJO;
  }

  private calcularColorIndice(indice: number | null): NivelAlertaColor {
    if (indice === null) return NivelAlertaColor.GRIS;
    if (indice < MAPA_DESGASTE_INDICE.UMBRAL_VERDE_MAX) return NivelAlertaColor.VERDE;
    if (indice <= MAPA_DESGASTE_INDICE.UMBRAL_AMARILLO_MAX) return NivelAlertaColor.AMARILLO;
    return NivelAlertaColor.ROJO;
  }

  private puntoToColumn(p: PuntoW): 'w1' | 'w2' | 'w3r' | 'w3l' {
    switch (p) {
      case PuntoW.W1:  return 'w1';
      case PuntoW.W2:  return 'w2';
      case PuntoW.W3R: return 'w3r';
      case PuntoW.W3L: return 'w3l';
      default:
        throw new BadRequestException(`Punto W no soportado: ${p}`);
    }
  }

  private hoyIso(): string {
    const h = new Date();
    const yyyy = h.getFullYear();
    const mm = String(h.getMonth() + 1).padStart(2, '0');
    const dd = String(h.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private redondear2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}