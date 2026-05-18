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

import { TipoAgrupacionDesgaste, TipoViaFiltro, PuntoW } from '../../../common/enums';

@Injectable()
export class WizardFiltrosService {
  private cachePaso2 = new Map<string, { data: WizardFiltrosResponseDto; expira: number }>();
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

  private paso1_tipoAgrupacion(): WizardFiltrosResponseDto {
    const opciones: OpcionWizardDto[] = [
      { id: 0, etiqueta: 'Tramo' },               // id no se usa, es decorativo
      { id: 1, etiqueta: 'Curva horizontal' },
      { id: 2, etiqueta: 'Curva vertical' },
    ];
    return { paso: 1, nombrePaso: 'Tipo de agrupación', opciones, multiSelect: false, permiteTodos: false, totalOpciones: opciones.length };
  }

  private async paso2_valorAgrupacion(request: WizardFiltrosRequestDto): Promise<WizardFiltrosResponseDto> {
    if (!request.tipoAgrupacion) throw new BadRequestException('Se requiere tipoAgrupacion');

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
        nombrePaso = 'Tramo';
        break;
      }
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL: {
        const curvas = await this.curvasHRepo
          .createQueryBuilder('c')
          .innerJoin('elementos_desgaste', 'e', 'e.curva_horizontal_id = c.id')
          .distinct(true)
          .orderBy('c.nombre', 'ASC')
          .getMany();
        opciones = curvas.map(c => ({ id: c.id, etiqueta: `${c.nombre} (radio ${c.radio}m)` }));
        nombrePaso = 'Curva horizontal';
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
        nombrePaso = 'Curva vertical';
        break;
      }
    }

    const response: WizardFiltrosResponseDto = {
      paso: 2, nombrePaso, opciones, multiSelect: false, permiteTodos: false, totalOpciones: opciones.length,
    };
    this.cachePaso2.set(cacheKey, { data: response, expira: ahora + this.TTL });
    return response;
  }

  private paso3_via(): WizardFiltrosResponseDto {
    const opciones: OpcionWizardDto[] = [
      { id: 0, etiqueta: 'Par' },
      { id: 1, etiqueta: 'Impar' },
      { id: 2, etiqueta: 'Ambas' },
    ];
    // Nota: los IDs aquí son posicionales; el frontend debe mapearlos al enum TipoViaFiltro
    return { paso: 3, nombrePaso: 'Vía', opciones, multiSelect: false, permiteTodos: false, totalOpciones: opciones.length };
  }

  private async paso4_elementos(request: WizardFiltrosRequestDto): Promise<WizardFiltrosResponseDto> {
    if (!request.tipoAgrupacion || !request.agrupacionId || !request.via) {
      throw new BadRequestException('Se requieren tipoAgrupacion, agrupacionId y via');
    }

    const q = this.elementosRepo
      .createQueryBuilder('e')
      .leftJoin('e.tramo', 'tramo')
      .leftJoin('e.curvaHorizontal', 'cH')
      .leftJoin('e.curvaVertical', 'cV')
      .orderBy('e.progresiva', 'ASC');

    switch (request.tipoAgrupacion) {
      case TipoAgrupacionDesgaste.TRAMO:
        q.andWhere('tramo.id = :id', { id: request.agrupacionId });
        break;
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL:
        q.andWhere('cH.id = :id', { id: request.agrupacionId });
        break;
      case TipoAgrupacionDesgaste.CURVA_VERTICAL:
        q.andWhere('cV.id = :id', { id: request.agrupacionId });
        break;
    }

    if (request.via !== TipoViaFiltro.AMBAS) {
      q.andWhere('e.via = :via', { via: request.via });
    }

    const elementos = await q.getMany();
    const opciones: OpcionWizardDto[] = elementos.map(e => ({
      id: e.codigoElemento,                     // número directamente
      etiqueta: `Elem. ${e.codigoElemento} (m=${e.progresiva}, ${e.via})`,
    }));

    return {
      paso: 4, nombrePaso: 'Elementos', opciones,
      multiSelect: true, permiteTodos: true, totalOpciones: opciones.length,
    };
  }

  private paso5_puntosW(): WizardFiltrosResponseDto {
    const opciones: OpcionWizardDto[] = [
      { id: 0, etiqueta: 'W1' },
      { id: 1, etiqueta: 'W2' },
      { id: 2, etiqueta: 'W3R' },
      { id: 3, etiqueta: 'W3L' },
    ];
    // El frontend debe mapear estos IDs al enum PuntoW
    return { paso: 5, nombrePaso: 'Puntos de medición', opciones, multiSelect: true, permiteTodos: true, totalOpciones: opciones.length };
  }

  private async paso6_escenarios(): Promise<WizardFiltrosResponseDto> {
    const ahora = Date.now();
    if (this.cachePaso6.data && this.cachePaso6.expira > ahora) return this.cachePaso6.data;

    const escenarios = await this.escenarioRepo.find({
      where: { eliminado: false },
      order: { nombre: 'ASC' },
    });

    const opciones: OpcionWizardDto[] = escenarios.map(e => ({
      id: e.id,
      etiqueta: e.nombre + (e.descripcion ? ` — ${e.descripcion.substring(0, 60)}` : ''),
    }));

    const response: WizardFiltrosResponseDto = {
      paso: 6, nombrePaso: 'Escenario', opciones,
      multiSelect: false, permiteTodos: false, totalOpciones: opciones.length,
    };
    this.cachePaso6 = { data: response, expira: ahora + this.TTL };
    return response;
  }
}