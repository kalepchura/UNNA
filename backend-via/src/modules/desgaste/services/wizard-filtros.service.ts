import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ElementoDesgaste } from '../../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';
import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../catalogos/curvas-verticales/entities/curva-vertical.entity';
import { EscenarioMTB } from '../entities/escenario-mtb.entity';

import { WizardFiltrosRequestDto } from '../dto/wizard/wizard-filtros-request.dto';
import { WizardFiltrosResponseDto, OpcionWizardDto } from '../dto/wizard/wizard-filtros-response.dto';

import { TipoAgrupacionDesgaste, TipoViaFiltro } from '../../../common/enums';

/**
 * ============================================================
 * WizardFiltrosService — G1 y G3
 * ============================================================
 *
 * Pasos del wizard:
 *  1. Tipo de agrupación (TRAMO | CURVA_H | CURVA_V)
 *  2. Valor de agrupación → lista de tramos/curvas disponibles
 *     multiSelect: TRUE  → el usuario puede elegir varios
 *  3. Vía (PAR | IMPAR | AMBAS)
 *  4. Elementos → depende de agrupacionIds[] + via
 *     multiSelect: TRUE  → el usuario puede elegir varios o todos
 *  5. Puntos W (W1 | W2 | W3R | W3L)
 *     multiSelect: TRUE
 *  6. Escenarios disponibles
 *     multiSelect: TRUE  → el usuario puede comparar varios escenarios
 *
 * Cambios respecto a la versión anterior:
 *  - Paso 2: ahora acepta y devuelve multiSelect: true
 *  - Paso 4: acepta agrupacionIds[] (array) en lugar de agrupacionId
 *  - Paso 6: multiSelect: true (antes era false)
 * ============================================================
 */
@Injectable()
export class WizardFiltrosService {
  // Cache paso 2: clave = tipoAgrupacion
  private cachePaso2 = new Map<string, { data: WizardFiltrosResponseDto; expira: number }>();

  // Cache paso 6: escenarios activos (poco cambian)
  private cachePaso6: { data: WizardFiltrosResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };

  private readonly TTL = 5 * 60 * 1000; // 5 min

  constructor(
    @InjectRepository(ElementoDesgaste)
    private readonly elementosRepo: Repository<ElementoDesgaste>,
    @InjectRepository(Tramo)
    private readonly tramosRepo: Repository<Tramo>,
    @InjectRepository(CurvaHorizontal)
    private readonly curvasHRepo: Repository<CurvaHorizontal>,
    @InjectRepository(CurvaVertical)
    private readonly curvasVRepo: Repository<CurvaVertical>,
    @InjectRepository(EscenarioMTB)
    private readonly escenarioRepo: Repository<EscenarioMTB>,
  ) {}

  async obtenerOpciones(request: WizardFiltrosRequestDto): Promise<WizardFiltrosResponseDto> {
    switch (request.paso) {
      case 1: return this.paso1_tipoAgrupacion();
      case 2: return this.paso2_valorAgrupacion(request);
      case 3: return this.paso3_via();
      case 4: return this.paso4_elementos(request);
      case 5: return this.paso5_puntosW();
      case 6: return this.paso6_escenarios();
      default: throw new BadRequestException(`Paso inválido: ${request.paso}`);
    }
  }

  // ----------------------------------------------------------
  // Paso 1: Tipo de agrupación
  // ----------------------------------------------------------

  private paso1_tipoAgrupacion(): WizardFiltrosResponseDto {
    const opciones: OpcionWizardDto[] = [
      { id: TipoAgrupacionDesgaste.TRAMO,            etiqueta: 'Tramo' },
      { id: TipoAgrupacionDesgaste.CURVA_HORIZONTAL, etiqueta: 'Curva horizontal' },
      { id: TipoAgrupacionDesgaste.CURVA_VERTICAL,   etiqueta: 'Curva vertical' },
    ];
    return {
      paso: 1,
      nombrePaso: 'Tipo de agrupación',
      opciones,
      multiSelect: false,
      permiteTodos: false,
      totalOpciones: opciones.length,
    };
  }

  // ----------------------------------------------------------
  // Paso 2: Valor de agrupación (multiSelect: true)
  // ----------------------------------------------------------

  private async paso2_valorAgrupacion(
    request: WizardFiltrosRequestDto,
  ): Promise<WizardFiltrosResponseDto> {
    if (!request.tipoAgrupacion) {
      throw new BadRequestException('Se requiere tipoAgrupacion para el paso 2');
    }

    const cacheKey = `paso2_${request.tipoAgrupacion}`;
    const cached = this.cachePaso2.get(cacheKey);
    const ahora = Date.now();
    if (cached && cached.expira > ahora) return cached.data;

    let opciones: OpcionWizardDto[] = [];
    let nombrePaso = '';

    switch (request.tipoAgrupacion) {
      case TipoAgrupacionDesgaste.TRAMO: {
        const tramos = await this.tramosRepo.find({ order: { orden: 'ASC' } });
        opciones = tramos.map(t => ({ id: t.id, etiqueta: t.nombre }));
        nombrePaso = 'Tramo(s)';
        break;
      }
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL: {
        // Solo curvas que tengan al menos un elemento de desgaste asociado
        const curvas = await this.curvasHRepo
          .createQueryBuilder('c')
          .innerJoin('elementos_desgaste', 'e', 'e.curva_horizontal_id = c.id')
          .distinct(true)
          .orderBy('c.nombre', 'ASC')
          .getMany();
        opciones = curvas.map(c => ({
          id: c.id,
          etiqueta: `${c.nombre} (radio ${c.radio}m)`,
        }));
        nombrePaso = 'Curva(s) horizontal(es)';
        break;
      }
      case TipoAgrupacionDesgaste.CURVA_VERTICAL: {
        const curvas = await this.curvasVRepo
          .createQueryBuilder('c')
          .innerJoin('elementos_desgaste', 'e', 'e.curva_vertical_id = c.id')
          .distinct(true)
          .orderBy('c.nombre', 'ASC')
          .getMany();
        opciones = curvas.map(c => ({ id: c.id, etiqueta: c.nombre }));
        nombrePaso = 'Curva(s) vertical(es)';
        break;
      }
    }

    const response: WizardFiltrosResponseDto = {
      paso: 2,
      nombrePaso,
      opciones,
      multiSelect: true,      // ← ahora el usuario puede elegir varios
      permiteTodos: true,
      totalOpciones: opciones.length,
    };

    this.cachePaso2.set(cacheKey, { data: response, expira: ahora + this.TTL });
    return response;
  }

  // ----------------------------------------------------------
  // Paso 3: Vía
  // ----------------------------------------------------------

  private paso3_via(): WizardFiltrosResponseDto {
    const opciones: OpcionWizardDto[] = [
      { id: TipoViaFiltro.PAR,    etiqueta: 'Par' },
      { id: TipoViaFiltro.IMPAR,  etiqueta: 'Impar' },
      { id: TipoViaFiltro.AMBAS,  etiqueta: 'Ambas' },
    ];
    return {
      paso: 3,
      nombrePaso: 'Vía',
      opciones,
      multiSelect: false,
      permiteTodos: false,
      totalOpciones: opciones.length,
    };
  }

  // ----------------------------------------------------------
  // Paso 4: Elementos (acepta agrupacionIds[] para múltiples)
  // ----------------------------------------------------------

  private async paso4_elementos(
    request: WizardFiltrosRequestDto,
  ): Promise<WizardFiltrosResponseDto> {
    // Acepta agrupacionIds (nuevo) o agrupacionId (retrocompatibilidad)
    const ids: number[] = request.agrupacionIds?.length
      ? request.agrupacionIds
      : request.agrupacionId
        ? [request.agrupacionId]
        : [];

    if (!request.tipoAgrupacion || ids.length === 0 || !request.via) {
      throw new BadRequestException(
        'Se requieren tipoAgrupacion, agrupacionIds (o agrupacionId) y via para el paso 4',
      );
    }

    const q = this.elementosRepo
      .createQueryBuilder('e')
      .leftJoin('e.tramo', 'tramo')
      .leftJoin('e.curvaHorizontal', 'cH')
      .leftJoin('e.curvaVertical', 'cV')
      .orderBy('e.progresiva', 'ASC');

    switch (request.tipoAgrupacion) {
      case TipoAgrupacionDesgaste.TRAMO:
        q.andWhere('tramo.id = ANY(:ids)', { ids });
        break;
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL:
        q.andWhere('cH.id = ANY(:ids)', { ids });
        break;
      case TipoAgrupacionDesgaste.CURVA_VERTICAL:
        q.andWhere('cV.id = ANY(:ids)', { ids });
        break;
    }

    if (request.via !== TipoViaFiltro.AMBAS) {
      q.andWhere('e.via = :via', { via: request.via });
    }

    const elementos = await q.getMany();
    const opciones: OpcionWizardDto[] = elementos.map(e => ({
      id: e.codigoElemento,
      etiqueta: `Elem. ${e.codigoElemento} (m=${e.progresiva} · ${e.via} · ${e.riel})`,
    }));

    return {
      paso: 4,
      nombrePaso: 'Elementos',
      opciones,
      multiSelect: true,
      permiteTodos: true,
      totalOpciones: opciones.length,
    };
  }

  // ----------------------------------------------------------
  // Paso 5: Puntos W
  // ----------------------------------------------------------

  private paso5_puntosW(): WizardFiltrosResponseDto {
    const opciones: OpcionWizardDto[] = [
      { id: 'W1',  etiqueta: 'W1' },
      { id: 'W2',  etiqueta: 'W2' },
      { id: 'W3R', etiqueta: 'W3R' },
      { id: 'W3L', etiqueta: 'W3L' },
    ];
    return {
      paso: 5,
      nombrePaso: 'Puntos de medición',
      opciones,
      multiSelect: true,
      permiteTodos: true,
      totalOpciones: opciones.length,
    };
  }

  // ----------------------------------------------------------
  // Paso 6: Escenarios (multiSelect: true — comparar escenarios)
  // ----------------------------------------------------------

  private async paso6_escenarios(): Promise<WizardFiltrosResponseDto> {
    const ahora = Date.now();
    if (this.cachePaso6.data && this.cachePaso6.expira > ahora) {
      return this.cachePaso6.data;
    }

    const escenarios = await this.escenarioRepo.find({
      where: { eliminado: false },
      order: { nombre: 'ASC' },
    });

    const opciones: OpcionWizardDto[] = escenarios.map(e => ({
      id: e.id,
      etiqueta: e.nombre + (e.descripcion ? ` — ${e.descripcion.substring(0, 60)}` : ''),
    }));

    const response: WizardFiltrosResponseDto = {
      paso: 6,
      nombrePaso: 'Escenario(s)',
      opciones,
      multiSelect: true,      // ← ahora el usuario puede comparar varios
      permiteTodos: false,    // no tiene sentido "todos" los escenarios
      totalOpciones: opciones.length,
    };

    this.cachePaso6 = { data: response, expira: ahora + this.TTL };
    return response;
  }

  // ----------------------------------------------------------
  // Invalidar caché (llamar cuando cambian escenarios)
  // ----------------------------------------------------------

  invalidarCachePaso6(): void {
    this.cachePaso6 = { data: null, expira: 0 };
  }

  invalidarCachePaso2(): void {
    this.cachePaso2.clear();
  }
}