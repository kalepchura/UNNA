import { Injectable, NotFoundException } from '@nestjs/common';
import { CurvasVerticalesRepository } from '../repositories/curvas-verticales.repository';
import { FiltrarCurvasVerticalesDto } from '../dto/filtrar-curvas-verticales.dto';
import { CurvaVerticalResponseDto } from '../dto/curva-vertical-response.dto';
import { TipoVia } from '../../../../common/enums';

@Injectable()
export class CurvasVerticalesService {
  constructor(private readonly repo: CurvasVerticalesRepository) {}

  async listarParaTabla(limit: number = 1000): Promise<CurvaVerticalResponseDto[]> {
    const curvas = await this.repo.listarParaTabla(limit);
    return curvas.map(c => CurvaVerticalResponseDto.fromEntity(c));
  }

  async listarParaSelector(): Promise<{ id: number; nombre: string; via: string }[]> {
    return this.repo.listarParaSelector();
  }

  async obtenerPorId(id: number): Promise<CurvaVerticalResponseDto> {
    const c = await this.repo.buscarPorId(id);
    if (!c) throw new NotFoundException(`Curva vertical con id ${id} no encontrada`);
    return CurvaVerticalResponseDto.fromEntity(c);
  }

  async listarParaFiltro() {
    return this.repo.listarParaFiltro();
  }

  async resolverPorProgresivaYVia(progresiva: number, via: TipoVia) {
    return this.repo.buscarPorProgresivaYVia(progresiva, via);
  }
}