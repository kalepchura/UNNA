import { Injectable, NotFoundException } from '@nestjs/common';
import { EstacionesRepository } from '../repositories/estaciones.repository';
import { FiltrarEstacionesDto } from '../dto/filtrar-estaciones.dto';
import { EstacionResponseDto } from '../dto/estacion-response.dto';
import { Estacion } from '../entities/estacion.entity';

@Injectable()
export class EstacionesService {
  constructor(private readonly estacionesRepo: EstacionesRepository) {}

   async listarParaTabla(limit: number = 1000): Promise<EstacionResponseDto[]> {
    const estaciones = await this.estacionesRepo.listarParaTabla(limit);
    return estaciones.map(e => EstacionResponseDto.fromEntity(e));
  }

  async listarParaSelector(): Promise<{ id: number; codigo: string; nombre: string }[]> {
    return this.estacionesRepo.listarParaSelector();
  }

  async obtenerPorId(id: number): Promise<EstacionResponseDto> {
    const e = await this.estacionesRepo.buscarPorId(id);
    if (!e) throw new NotFoundException(`Estación con id ${id} no encontrada`);
    return EstacionResponseDto.fromEntity(e);
  }

  async listarParaFiltro() {
    return this.estacionesRepo.listarParaFiltro();
  }

  async listarTodas(): Promise<Estacion[]> {
    return this.estacionesRepo.listarTodas();
  }
}