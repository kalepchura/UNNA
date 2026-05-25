import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';

import { MedicionDesgaste } from '../entities/medicion-desgaste.entity';
import { MedicionesDesgasteRepository } from '../repositories/mediciones-desgaste.repository';
import { CargarGrillaDto } from '../dto/grilla/cargar-grilla.dto';
import {
  GrillaResponseDto,
  FilaGrillaDto,
} from '../dto/grilla/grilla-response.dto';
import {
  GuardarCambiosDto,
  CeldaModificadaDto,
} from '../dto/grilla/guardar-cambios.dto';
import { GuardarCambiosResponseDto } from '../dto/grilla/guardar-cambios-response.dto';

import { ElementoDesgaste } from '../../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';
import { EscenarioMTB } from '../entities/escenario-mtb.entity';

import { AuditoriaService } from '../../auditoria/services/auditoria.service';
import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';
import {
  ModuloAuditoria,
  OperacionAuditoria,
  PuntoW,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

import { KpisDesgasteService } from './kpis-desgaste.service';
import { GraficoG1Service } from './grafico-g1.service';
import { GraficoG2Service } from './grafico-g2.service';
import { GraficoG3Service } from './grafico-g3.service';

@Injectable()
export class MedicionesDesgasteService {
  private readonly NOMBRE_ENTIDAD = 'MedicionDesgaste';

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(ElementoDesgaste)
    private readonly elementosRepo: Repository<ElementoDesgaste>,

    @InjectRepository(EscenarioMTB)
    private readonly escenariosRepo: Repository<EscenarioMTB>,

    private readonly medicionesRepo: MedicionesDesgasteRepository,
    private readonly auditoria: AuditoriaService,
    private readonly kpisService: KpisDesgasteService,
    private readonly grafico1Service: GraficoG1Service,
    private readonly grafico2Service: GraficoG2Service,
    private readonly grafico3Service: GraficoG3Service,
  ) {}

  async cargarGrilla(
    filtros: CargarGrillaDto,
  ): Promise<GrillaResponseDto> {
    await this.validarEscenarioExiste(filtros.escenarioId);

    const anios = await this.resolverAnios(
      filtros.escenarioId,
      filtros.anios,
    );

    const tramoIds =
      filtros.tramoIds?.length ? filtros.tramoIds : null;

    const elementos = await this.cargarElementos(tramoIds);

    if (elementos.length === 0) {
      return {
        anios,
        filas: [],
        totalElementos: 0,
      };
    }

    const mediciones =
      await this.medicionesRepo.listarPorElementosYAnios(
        elementos.map((e) => e.id),
        anios,
        filtros.escenarioId,
      );

    const mapaMediciones = new Map<string, MedicionDesgaste>();

    for (const m of mediciones) {
      mapaMediciones.set(
        `${m.elementoId}-${m.anio}-${m.trimestre}`,
        m,
      );
    }

    const filas: FilaGrillaDto[] = elementos.map((e) =>
      this.construirFila(e, anios, mapaMediciones),
    );

    return {
      anios,
      filas,
      totalElementos: elementos.length,
    };
  }

  async guardarCambios(
    dto: GuardarCambiosDto,
    user: AuthenticatedUser,
  ): Promise<GuardarCambiosResponseDto> {
    const { cambios, escenarioId } = dto;

    await this.validarEscenarioExiste(escenarioId);
    await this.validarElementosExisten(cambios);

    const grupos = this.agruparCeldasPorFila(cambios);

    let filasCreadas = 0;
    let filasActualizadas = 0;

    await this.dataSource.transaction(async (manager) => {
      for (const [, grupo] of grupos) {
        const valoresW = this.celdasAValoresW(grupo.celdas);

        const { creada } =
          await this.medicionesRepo.upsertEnTransaccion(
            manager,
            grupo.elementoId,
            escenarioId,
            grupo.anio,
            grupo.trimestre,
            valoresW,
          );

        if (creada) {
          filasCreadas++;
        } else {
          filasActualizadas++;
        }
      }
    });

    const filasAfectadas =
      filasCreadas + filasActualizadas;

    const celdasModificadas = cambios.length;

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.DESGASTE,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: 'BULK',
      operacion: OperacionAuditoria.BULK_LOAD,
      user,
      registrosAfectados: celdasModificadas,
      detalle: {
        escenarioId,
        filasCreadas,
        filasActualizadas,
        celdasModificadas,
      },
    });

    this.invalidarCacheAnalitico();

    return {
      celdasModificadas,
      filasAfectadas,
      filasCreadas,
      filasActualizadas,
      fechaProceso: new Date(),
    };
  }

  // ----------------------------------------------------------
  // HELPERS PRIVADOS
  // ----------------------------------------------------------

  private async validarEscenarioExiste(
    escenarioId: number,
  ): Promise<void> {
    const existe = await this.escenariosRepo.findOne({
      where: { id: escenarioId },
      select: ['id'],
    });

    if (!existe) {
      throw new NotFoundException(
        `Escenario ${escenarioId} no encontrado`,
      );
    }
  }

  private async resolverAnios(
    escenarioId: number,
    aniosUsuario?: number[],
  ): Promise<number[]> {
    if (aniosUsuario && aniosUsuario.length > 0) {
      return [...new Set(aniosUsuario)].sort(
        (a, b) => a - b,
      );
    }

    const aniosConDatos =
      await this.medicionesRepo.obtenerAniosConDatos(
        escenarioId,
      );

    const anioActual = new Date().getFullYear();

    const set = new Set<number>(aniosConDatos);
    set.add(anioActual);

    return [...set].sort((a, b) => a - b);
  }

  private async cargarElementos(
    tramoIds: number[] | null,
  ): Promise<ElementoDesgaste[]> {
    const q = this.elementosRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.tramo', 'tramo')
      .orderBy('e.progresiva', 'ASC');

    if (tramoIds && tramoIds.length > 0) {
      q.where('e.tramo_id IN (:...ids)', {
        ids: tramoIds,
      });
    }

    return q.getMany();
  }

  private construirFila(
    elemento: ElementoDesgaste,
    anios: number[],
    mapaMediciones: Map<string, MedicionDesgaste>,
  ): FilaGrillaDto {
    const mediciones: FilaGrillaDto['mediciones'] = {};

    for (const anio of anios) {
      mediciones[anio] = {};

      for (const trimestre of [1, 2, 3, 4]) {
        const key = `${elemento.id}-${anio}-${trimestre}`;

        const m = mapaMediciones.get(key);

        mediciones[anio][trimestre] = {
          w1: m?.w1 != null ? parseFloat(m.w1) : null,
          w2: m?.w2 != null ? parseFloat(m.w2) : null,
          w3r: m?.w3r != null ? parseFloat(m.w3r) : null,
          w3l: m?.w3l != null ? parseFloat(m.w3l) : null,
        };
      }
    }

    return {
      elementoId: elemento.id,
      codigoElemento: elemento.codigoElemento,
      progresiva: elemento.progresiva,
      via: elemento.via,
      tramoCodigo: elemento.tramo?.codigo ?? '',
      tramoNombre: elemento.tramo?.nombre ?? '',
      mediciones,
    };
  }

  private agruparCeldasPorFila(
    cambios: CeldaModificadaDto[],
  ) {
    const grupos = new Map<
      string,
      {
        elementoId: number;
        anio: number;
        trimestre: number;
        celdas: CeldaModificadaDto[];
      }
    >();

    for (const c of cambios) {
      const key = `${c.elementoId}-${c.anio}-${c.trimestre}`;

      const existente = grupos.get(key);

      if (existente) {
        existente.celdas.push(c);
      } else {
        grupos.set(key, {
          elementoId: c.elementoId,
          anio: c.anio,
          trimestre: c.trimestre,
          celdas: [c],
        });
      }
    }

    return grupos;
  }

  private celdasAValoresW(
    celdas: CeldaModificadaDto[],
  ) {
    const valores: {
      w1?: string | null;
      w2?: string | null;
      w3r?: string | null;
      w3l?: string | null;
    } = {};

    for (const c of celdas) {
      const valorString =
        c.valor === null
          ? null
          : c.valor.toFixed(2);

      switch (c.punto) {
        case PuntoW.W1:
          valores.w1 = valorString;
          break;

        case PuntoW.W2:
          valores.w2 = valorString;
          break;

        case PuntoW.W3R:
          valores.w3r = valorString;
          break;

        case PuntoW.W3L:
          valores.w3l = valorString;
          break;
      }
    }

    return valores;
  }

  private async validarElementosExisten(
    cambios: CeldaModificadaDto[],
  ): Promise<void> {
    const idsUnicos = [
      ...new Set(cambios.map((c) => c.elementoId)),
    ];

    const elementos = await this.elementosRepo.find({
      where: {
        id: In(idsUnicos),
      },
      select: ['id'],
    });

    if (elementos.length !== idsUnicos.length) {
      const encontrados = new Set(
        elementos.map((e) => e.id),
      );

      const faltantes = idsUnicos.filter(
        (id) => !encontrados.has(id),
      );

      throw new NotFoundException(
        `Elementos no encontrados: ${faltantes.join(', ')}`,
      );
    }
  }

  private invalidarCacheAnalitico(): void {
    this.kpisService.invalidarCache();
    this.grafico1Service.invalidarCacheBase();
    this.grafico2Service.invalidarCacheBase();
    this.grafico3Service.invalidarCacheBase();
  }
}