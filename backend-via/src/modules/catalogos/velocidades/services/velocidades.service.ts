import { Injectable, NotFoundException } from '@nestjs/common';
import { VelocidadesRepository } from '../repositories/velocidades.repository';
import { FiltrarVelocidadesDto } from '../dto/filtrar-velocidades.dto';
import { VelocidadResponseDto } from '../dto/velocidad-response.dto';

@Injectable()
export class VelocidadesService {
  constructor(private readonly repo: VelocidadesRepository) {}

  async listarParaTabla(limit: number = 1000): Promise<VelocidadResponseDto[]> {
    const velocidades = await this.repo.listarParaTabla(limit);
    return velocidades.map(v => VelocidadResponseDto.fromEntity(v));
  }

  async obtenerPorId(id: number): Promise<VelocidadResponseDto> {
    const v = await this.repo.buscarPorId(id);
    if (!v) throw new NotFoundException(`Velocidad con id ${id} no encontrada`);
    return VelocidadResponseDto.fromEntity(v);
  }

  /** Para dropdowns: solo los valores únicos en km/h. */
  async listarParaFiltro(): Promise<number[]> {
    return this.repo.listarValoresDistintos();
  }

  /** Resuelve velocidad por progresiva (uso interno de otros módulos). */
  async resolverPorProgresiva(progresiva: number) {
    return this.repo.buscarPorProgresiva(progresiva);
  }
}