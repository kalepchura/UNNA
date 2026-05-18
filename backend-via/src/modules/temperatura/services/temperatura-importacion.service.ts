import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TemperaturaImportacionRepository } from '../repositories/temperatura-importacion.repository';
import { TemperaturaRepository } from '../repositories/temperatura.repository';
import { TemperaturaParserFactory } from '../parsers/temperatura-parser.factory';

import { ImportarTemperaturaDto } from '../dto/importar-temperatura.dto';
import { ImportacionResultadoDto } from '../dto/importacion-resultado.dto';

import { TramosService } from '../../catalogos/tramos/services/tramos.service';
import { ArchivoMulter, StorageService } from '../../../common/services/storage.service';
import { STORAGE_BUCKETS } from '../../../common/constants/storage-buckets';

import { AuditoriaService } from '../../auditoria/services/auditoria.service';
import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { FiltrarImportacionesDto } from '../dto/filtrar-importaciones.dto';
import { ImportacionResponseDto } from '../dto/importacion-response.dto';

// Servicios analíticos para invalidar caché
import { KpisTemperaturaService } from './kpis-temperatura.service';
import { GraficoG1TempService } from './grafico-g1-temp.service';
import { GraficoG2TempService } from './grafico-g2-temp.service';
import { GraficoG3TempService } from './grafico-g3-temp.service';

@Injectable()
export class TemperaturaImportacionService {
  private readonly logger = new Logger(TemperaturaImportacionService.name);
  private readonly NOMBRE_ENTIDAD = 'TemperaturaImportacion';

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly importacionRepo: TemperaturaImportacionRepository,
    private readonly temperaturaRepo: TemperaturaRepository,
    private readonly parserFactory: TemperaturaParserFactory,
    private readonly tramosService: TramosService,
    private readonly storage: StorageService,
    private readonly auditoria: AuditoriaService,
    private readonly kpisService: KpisTemperaturaService,
    private readonly grafico1Service: GraficoG1TempService,
    private readonly grafico2Service: GraficoG2TempService,
    private readonly grafico3Service: GraficoG3TempService,
  ) {}

  async importar(
    archivo: ArchivoMulter,
    dto: ImportarTemperaturaDto,
    user: AuthenticatedUser,
  ): Promise<ImportacionResultadoDto> {
    const tipoArchivo = this.parserFactory.detectarTipo(archivo.originalname);
    const tramo = await this.tramosService.resolverPorProgresiva(dto.progresiva);

    const subido = await this.storage.subir(
      STORAGE_BUCKETS.TEMPERATURA_IMPORTACIONES,
      archivo,
      `tramo-${tramo.id}`,
    );

    let importacionIdCreada: number | null = null;
    let primerosErrores: string[] = [];
    let totalRegistros = 0;
    let registrosValidos = 0;
    let registrosInvalidos = 0;

    try {
      await this.dataSource.transaction(async (manager) => {
        const cabecera = await this.importacionRepo.crearEnTransaccion(manager, {
          nombreArchivo: archivo.originalname,
          progresiva: dto.progresiva,
          tramoId: tramo.id,
          tipoArchivo,
          comentarioEspecialista: dto.comentarioEspecialista ?? null,
          totalRegistros: 0,
          registrosValidos: 0,
          registrosInvalidos: 0,
          urlArchivo: subido.rutaStorage,
          creadoPor: user.id,
          actualizadoPor: null,
          eliminado: false,
          eliminadoPorId: null,
        });

        importacionIdCreada = cabecera.id;

        const parser = this.parserFactory.obtenerParser(tipoArchivo);
        const resultado = await parser.parsear(archivo.buffer, cabecera.id);

        totalRegistros = resultado.totalFilas;
        registrosValidos = resultado.validos.length;
        registrosInvalidos = resultado.errores.length;
        primerosErrores = resultado.errores.slice(0, 50);

        if (resultado.validos.length > 0) {
          await this.temperaturaRepo.insertarEnLoteEnTransaccion(
            manager,
            resultado.validos,
          );
        }

        await this.importacionRepo.actualizarTotalesEnTransaccion(
          manager,
          cabecera.id,
          { totalRegistros, registrosValidos, registrosInvalidos },
        );
      });
    } catch (err) {
      this.logger.error(`Importación falló, limpiando archivo huérfano: ${subido.rutaStorage}`);
      await this.storage.eliminar(STORAGE_BUCKETS.TEMPERATURA_IMPORTACIONES, subido.rutaStorage);
      const mensaje = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`No se pudo importar el archivo: ${mensaje}`);
    }

    if (importacionIdCreada !== null) {
      await registrarAuditoria(this.auditoria, {
        modulo: ModuloAuditoria.TEMPERATURA,
        entidad: this.NOMBRE_ENTIDAD,
        entidadId: String(importacionIdCreada),
        operacion: OperacionAuditoria.IMPORT,
        user,
        registrosAfectados: registrosValidos,
        detalle: {
          nombreArchivo: archivo.originalname,
          progresiva: dto.progresiva,
          tramoCodigo: tramo.codigo,
          totalRegistros,
          registrosValidos,
          registrosInvalidos,
        },
      });
    }

    if (importacionIdCreada === null) {
      throw new InternalServerErrorException('Importación no creada');
    }

    const cabeceraConTramo = await this.importacionRepo.buscarPorIdConTramo(importacionIdCreada);

    this.invalidarCacheAnalitico(); // ✅ NUEVO

    return {
      importacionId: cabeceraConTramo!.id,
      nombreArchivo: cabeceraConTramo!.nombreArchivo,
      tipoArchivo: cabeceraConTramo!.tipoArchivo,
      progresiva: cabeceraConTramo!.progresiva,
      tramoId: cabeceraConTramo!.tramoId,
      tramoCodigo: cabeceraConTramo!.tramo.codigo,
      tramoNombre: cabeceraConTramo!.tramo.nombre,
      totalRegistros: cabeceraConTramo!.totalRegistros,
      registrosValidos: cabeceraConTramo!.registrosValidos,
      registrosInvalidos: cabeceraConTramo!.registrosInvalidos,
      primerosErrores,
      fechaSubida: cabeceraConTramo!.fechaSubida,
    };
  }

  async eliminar(id: number, user: AuthenticatedUser): Promise<void> {
    const imp = await this.importacionRepo.buscarPorId(id);
    if (!imp) {
      throw new BadRequestException(`Importación ${id} no encontrada o ya eliminada`);
    }
    if (imp.eliminado) {
      throw new BadRequestException('La importación ya está eliminada');
    }

    await this.importacionRepo.actualizar(imp, {
      eliminado: true,
      eliminadoPorId: user.id,
      actualizadoPor: user.id,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.TEMPERATURA,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.DELETE,
      user,
      detalle: {
        nombreArchivo: imp.nombreArchivo,
        progresiva: imp.progresiva,
        registrosAfectados: imp.registrosValidos,
      },
    });

    this.invalidarCacheAnalitico(); // ✅ NUEVO
  }

  async restaurar(id: number, user: AuthenticatedUser): Promise<void> {
    const imp = await this.importacionRepo.buscarPorId(id, true);
    if (!imp) throw new BadRequestException(`Importación ${id} no encontrada`);
    if (!imp.eliminado) {
      throw new BadRequestException('La importación no está eliminada');
    }

    await this.importacionRepo.actualizar(imp, {
      eliminado: false,
      eliminadoPorId: null,
      actualizadoPor: user.id,
    });

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.TEMPERATURA,
      entidad: this.NOMBRE_ENTIDAD,
      entidadId: String(id),
      operacion: OperacionAuditoria.RESTORE,
      user,
      detalle: {
        nombreArchivo: imp.nombreArchivo,
        registrosAfectados: imp.registrosValidos,
      },
    });

    this.invalidarCacheAnalitico(); // ✅ NUEVO
  }

  async listarEliminadas(filtros: FiltrarImportacionesDto) {
    const [importaciones, total] = await this.importacionRepo.listar({
      tramoIds: filtros.tramoIds,
      tipoArchivo: filtros.tipoArchivo,
      fechaSubidaDesde: filtros.fechaSubidaDesde,
      fechaSubidaHasta: filtros.fechaSubidaHasta,
      creadoPorId: filtros.creadoPorId,
      nombreArchivo: filtros.nombreArchivo,
      registrosValidosMin: filtros.registrosValidosMin,
      soloEliminados: true,
      page: filtros.page,
      limit: filtros.limit,
    });

    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    return {
      data: importaciones.map((i) => ImportacionResponseDto.fromEntity(i)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async contarEliminadas(): Promise<number> {
    return this.importacionRepo.contarEliminadas();
  }

  // ✅ NUEVO: Invalidación de caché analítica
  private invalidarCacheAnalitico(): void {
    this.kpisService.invalidarCache();
    this.grafico1Service.invalidarCacheBase();
    this.grafico2Service.invalidarCacheBase();
    this.grafico3Service.invalidarCacheBase();
  }
}