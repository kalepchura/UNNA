import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EscenariosMtbRepository } from '../repositories/escenarios-mtb.repository';
import { EscenarioMTB } from '../entities/escenario-mtb.entity';
import { CrearEscenarioMtbDto } from '../dto/escenario-mtb/crear-escenario-mtb.dto';
import { ActualizarEscenarioMtbDto } from '../dto/escenario-mtb/actualizar-escenario-mtb.dto';
import { FiltrarEscenariosMtbDto } from '../dto/escenario-mtb/filtrar-escenarios-mtb.dto';
import { EscenarioMtbResponseDto } from '../dto/escenario-mtb/escenario-mtb-response.dto';

import { AuditoriaService } from '../../auditoria/services/auditoria.service';
import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { ESCENARIO_REAL_NOMBRE } from '../../../common/constants/desgaste.constants';
import { KpisDesgasteService } from './kpis-desgaste.service';
import { GraficoG2Service } from './grafico-g2.service';
import { GraficoG3Service } from './grafico-g3.service';

@Injectable()
export class EscenariosMtbService {
  private readonly NOMBRE_ENTIDAD = 'EscenarioMTB';

  constructor(
    private readonly escenariosRepo: EscenariosMtbRepository,
    private readonly auditoria: AuditoriaService,
    private readonly kpisService: KpisDesgasteService,
    private readonly grafico2Service: GraficoG2Service,
    private readonly grafico3Service: GraficoG3Service,
  ) {}

  // ----------------------------------------------------------
  // LISTAR
  // ----------------------------------------------------------

  async listar(filtros: FiltrarEscenariosMtbDto) {
    const [escenarios, total] = await this.escenariosRepo.listar(filtros);
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    return {
      data: escenarios.map((e) => EscenarioMtbResponseDto.fromEntity(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listarEliminados(filtros: FiltrarEscenariosMtbDto) {
    const [escenarios, total] = await this.escenariosRepo.listar({
      ...filtros,
      soloEliminados: true,
    });
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    return {
      data: escenarios.map((e) => EscenarioMtbResponseDto.fromEntity(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerPorId(id: number, incluirEliminados = false): Promise<EscenarioMtbResponseDto> {
    const esc = await this.escenariosRepo.buscarPorId(id, incluirEliminados);
    if (!esc) throw new NotFoundException(`Escenario ${id} no encontrado`);
    return EscenarioMtbResponseDto.fromEntity(esc);
  }

  // ----------------------------------------------------------
  // CREAR
  // ----------------------------------------------------------

  async crear(
    dto: CrearEscenarioMtbDto,
    user: AuthenticatedUser,
  ): Promise<EscenarioMtbResponseDto> {
    this.validarNoEsReservado(dto.nombre);

    const existente = await this.escenariosRepo.buscarPorNombre(dto.nombre);
    if (existente) {
      throw new ConflictException(
        `Ya existe un escenario con el nombre "${dto.nombre}"` +
          (existente.eliminado ? ' (eliminado, contacte al admin para restaurarlo)' : ''),
      );
    }

    const creado = await this.escenariosRepo.crear({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      creadoPor: user.id,
      actualizadoPor: null,
      eliminado: false,
      eliminadoPorId: null,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.DESGASTE,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(creado.id),
      operacion: OperacionAuditoria.CREATE,
      user,
      detalle: { nombre: creado.nombre },
    });

    this.invalidarCacheAnalitico();

    return EscenarioMtbResponseDto.fromEntity(creado);
  }

  // ----------------------------------------------------------
  // ACTUALIZAR
  // ----------------------------------------------------------

  async actualizar(
    id: number,
    dto: ActualizarEscenarioMtbDto,
    user: AuthenticatedUser,
  ): Promise<EscenarioMtbResponseDto> {
    const esc = await this.escenariosRepo.buscarPorId(id);
    if (!esc) throw new NotFoundException(`Escenario ${id} no encontrado`);

    if (esc.nombre === ESCENARIO_REAL_NOMBRE && dto.nombre !== undefined && dto.nombre !== ESCENARIO_REAL_NOMBRE) {
      throw new BadRequestException(
        `El escenario '${ESCENARIO_REAL_NOMBRE}' no puede ser renombrado`,
      );
    }

    const cambios: Partial<EscenarioMTB> = { actualizadoPor: user.id };

    if (dto.nombre !== undefined && dto.nombre !== esc.nombre) {
      this.validarNoEsReservado(dto.nombre);

      const conflicto = await this.escenariosRepo.buscarPorNombre(dto.nombre);
      if (conflicto && conflicto.id !== id) {
        throw new ConflictException(
          `Ya existe un escenario con el nombre "${dto.nombre}"`,
        );
      }
      cambios.nombre = dto.nombre;
    }

    if (dto.descripcion !== undefined) {
      cambios.descripcion = dto.descripcion;
    }

    await this.escenariosRepo.actualizar(esc, cambios);

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.DESGASTE,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.UPDATE,
      user,
      detalle: { camposCambiados: Object.keys(dto) },
    });

    this.invalidarCacheAnalitico();

    const actualizado = await this.escenariosRepo.buscarPorId(id);
    return EscenarioMtbResponseDto.fromEntity(actualizado!);
  }

  // ----------------------------------------------------------
  // ELIMINAR (soft delete)
  // ----------------------------------------------------------

  async eliminar(id: number, user: AuthenticatedUser): Promise<void> {
    const esc = await this.escenariosRepo.buscarPorId(id);
    if (!esc) throw new NotFoundException(`Escenario ${id} no encontrado`);

    if (esc.nombre === ESCENARIO_REAL_NOMBRE) {
      throw new BadRequestException(
        `El escenario '${ESCENARIO_REAL_NOMBRE}' es necesario para el sistema y no puede ser eliminado`,
      );
    }

    if (esc.eliminado) {
      throw new BadRequestException('El escenario ya está eliminado');
    }

    await this.escenariosRepo.actualizar(esc, {
      eliminado: true,
      eliminadoPorId: user.id,
      actualizadoPor: user.id,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.DESGASTE,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.DELETE,
      user,
      detalle: { nombre: esc.nombre },
    });

    this.invalidarCacheAnalitico();
  }

  // ----------------------------------------------------------
  // RESTAURAR (admin)
  // ----------------------------------------------------------

  async restaurar(id: number, user: AuthenticatedUser): Promise<void> {
    const esc = await this.escenariosRepo.buscarPorId(id, true);
    if (!esc) throw new NotFoundException(`Escenario ${id} no encontrado`);

    if (!esc.eliminado) {
      throw new BadRequestException('El escenario no está eliminado');
    }

    const conflicto = await this.escenariosRepo.buscarPorNombre(esc.nombre);
    if (conflicto && conflicto.id !== id && !conflicto.eliminado) {
      throw new ConflictException(
        `No se puede restaurar: ya existe un escenario activo con el nombre "${esc.nombre}". ` +
        `Renombre o elimine el otro antes de restaurar este.`,
      );
    }

    await this.escenariosRepo.actualizar(esc, {
      eliminado: false,
      eliminadoPorId: null,
      actualizadoPor: user.id,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.DESGASTE,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.RESTORE,
      user,
      detalle: { nombre: esc.nombre },
    });

    this.invalidarCacheAnalitico();
  }

  // ----------------------------------------------------------
  // PARA RESUMEN DE ELIMINADOS (auditoría)
  // ----------------------------------------------------------

  async contarEliminados(): Promise<number> {
    return this.escenariosRepo.contarEliminados();
  }

  // ----------------------------------------------------------
  // HELPERS PRIVADOS
  // ----------------------------------------------------------

  private validarNoEsReservado(nombre: string): void {
    if (nombre.trim().toUpperCase() === ESCENARIO_REAL_NOMBRE) {
      throw new BadRequestException(
        `El nombre '${ESCENARIO_REAL_NOMBRE}' está reservado para el escenario histórico del sistema`,
      );
    }
  }

  private invalidarCacheAnalitico(): void {
    this.kpisService.invalidarCache();
    this.grafico2Service.invalidarCacheBase();
    this.grafico3Service.invalidarCacheBase();
  }
}