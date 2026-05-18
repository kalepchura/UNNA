import { Injectable, NotFoundException } from '@nestjs/common';
import { ElementosDesgasteRepository } from '../repositories/elementos-desgaste.repository';
import { FiltrarElementosDesgasteDto } from '../dto/filtrar-elementos-desgaste.dto';
import { ElementoDesgasteResponseDto } from '../dto/elemento-desgaste-response.dto';

@Injectable()
export class ElementosDesgasteService {
  constructor(private readonly repo: ElementosDesgasteRepository) {}

  async listarParaTabla(limit: number = 1000): Promise<ElementoDesgasteResponseDto[]> {
    const elementos = await this.repo.listarParaTabla(limit);
    return elementos.map(e => ElementoDesgasteResponseDto.fromEntity(e));
  }

  async listarParaSelector(): Promise<{ id: number; codigoElemento: number }[]> {
    return this.repo.listarParaSelector();
  }

  async obtenerPorId(id: number): Promise<ElementoDesgasteResponseDto> {
    const e = await this.repo.buscarPorId(id);
    if (!e) throw new NotFoundException(`Elemento con id ${id} no encontrado`);
    return ElementoDesgasteResponseDto.fromEntity(e);
  }

  async listarParaFiltro() {
    return this.repo.listarParaFiltro();
  }
}