import { Injectable, NotFoundException } from '@nestjs/common';
import { TemperaturaImportacionRepository } from '../repositories/temperatura-importacion.repository';
import { TemperaturaRepository } from '../repositories/temperatura.repository';
import { FiltrarImportacionesDto } from '../dto/filtrar-importaciones.dto';
import { FiltrarTemperaturasDto } from '../dto/filtrar-temperaturas.dto';
import { ImportacionResponseDto } from '../dto/importacion-response.dto';
import { TemperaturaResponseDto } from '../dto/temperatura-response.dto';
import { StorageService } from '../../../common/services/storage.service';
import { STORAGE_BUCKETS } from '../../../common/constants/storage-buckets';

@Injectable()
export class TemperaturaConsultaService {
  constructor(
    private readonly importacionRepo: TemperaturaImportacionRepository,
    private readonly temperaturaRepo: TemperaturaRepository,
    private readonly storage: StorageService,
  ) {}

  async listar(filtros: FiltrarImportacionesDto) {
    const [importaciones, total] = await this.importacionRepo.listar({
      tramoIds: filtros.tramoIds,
      tipoArchivo: filtros.tipoArchivo,
      fechaSubidaDesde: filtros.fechaSubidaDesde,
      fechaSubidaHasta: filtros.fechaSubidaHasta,
      creadoPorId: filtros.creadoPorId,
      nombreArchivo: filtros.nombreArchivo,
      registrosValidosMin: filtros.registrosValidosMin,
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

  async obtenerPorId(id: number, incluirEliminadas = false): Promise<ImportacionResponseDto> {
    const imp = await this.importacionRepo.buscarPorId(id, incluirEliminadas);
    if (!imp) throw new NotFoundException(`Importación ${id} no encontrada`);
    return ImportacionResponseDto.fromEntity(imp);
  }

  async listarRegistrosDeImportacion(
    importacionId: number,
    filtros: FiltrarTemperaturasDto,
  ) {
    const imp = await this.importacionRepo.buscarPorId(importacionId);
    if (!imp) {
      throw new NotFoundException(
        `Importación ${importacionId} no encontrada o eliminada`,
      );
    }

    const [filas, total] = await this.temperaturaRepo.listarPorImportacion(
      importacionId,
      filtros,
    );
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 100;

    return {
      data: filas.map((t) => TemperaturaResponseDto.fromEntity(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerUrlArchivo(importacionId: number): Promise<{ url: string; nombre: string }> {
    const imp = await this.importacionRepo.buscarPorId(importacionId, true);
    if (!imp) throw new NotFoundException(`Importación ${importacionId} no encontrada`);

    if (!imp.urlArchivo) {
      throw new NotFoundException('Esta importación no tiene archivo asociado');
    }

    const url = await this.storage.firmarUrl(
      STORAGE_BUCKETS.TEMPERATURA_IMPORTACIONES,
      imp.urlArchivo,
      3600,
    );

    return { url, nombre: imp.nombreArchivo };
  }
}