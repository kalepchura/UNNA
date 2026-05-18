import { Injectable, NotFoundException } from '@nestjs/common';
import { CambiaviasRepository } from '../repositories/cambiavias.repository';
import { FiltrarCambiaviasDto } from '../dto/filtrar-cambiavias.dto';
import { CambiaviaResponseDto } from '../dto/cambiavia-response.dto';

@Injectable()
export class CambiaviasService {
  constructor(private readonly repo: CambiaviasRepository) {}

  async listarParaTabla(limit: number = 1000): Promise<CambiaviaResponseDto[]> {
    const cambiavias = await this.repo.listarParaTabla(limit);
    return cambiavias.map(c => CambiaviaResponseDto.fromEntity(c));
  }

  async listarParaSelector(): Promise<{ id: number; codigoBd: string }[]> {
    return this.repo.listarParaSelector();
  }

  async obtenerPorId(id: number): Promise<CambiaviaResponseDto> {
    const c = await this.repo.buscarPorId(id);
    if (!c) throw new NotFoundException(`Cambiavía con id ${id} no encontrado`);
    return CambiaviaResponseDto.fromEntity(c);
  }

  async listarParaFiltro() {
    return this.repo.listarParaFiltro();
  }

  /**
   * Resuelve cambiavía por código (uso interno cuando otro módulo
   * lo necesita, ej: módulo Fallas para FallaSoldaduraInox).
   */
  async resolverPorCodigoBd(codigoBd: string) {
    const c = await this.repo.buscarPorCodigoBd(codigoBd);
    if (!c) throw new NotFoundException(`Cambiavía '${codigoBd}' no encontrado`);
    return c;
  }
}