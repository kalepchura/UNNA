import { Injectable, NotFoundException } from '@nestjs/common';
import { CurvasHorizontalesRepository } from '../repositories/curvas-horizontales.repository';
import { FiltrarCurvasHorizontalesDto } from '../dto/filtrar-curvas-horizontales.dto';
import { CurvaHorizontalResponseDto } from '../dto/curva-horizontal-response.dto';
import { TipoVia } from '../../../../common/enums';

@Injectable()
export class CurvasHorizontalesService {
  constructor(private readonly repo: CurvasHorizontalesRepository) {}

  async listarParaTabla(limit: number = 1000): Promise<CurvaHorizontalResponseDto[]> {
    const curvas = await this.repo.listarParaTabla(limit);
    return curvas.map(c => CurvaHorizontalResponseDto.fromEntity(c));
  }


  async listarParaSelector(): Promise<{ id: number; nombre: string; via: string }[]> {
    return this.repo.listarParaSelector();
  }

  async obtenerPorId(id: number): Promise<CurvaHorizontalResponseDto> {
    const c = await this.repo.buscarPorId(id);
    if (!c) throw new NotFoundException(`Curva horizontal con id ${id} no encontrada`);
    return CurvaHorizontalResponseDto.fromEntity(c);
  }

  async listarParaFiltro() {
    return this.repo.listarParaFiltro();
  }

  /**
   * Devuelve la curva H que aplica a una progresiva+vía, o null si no aplica
   * (la progresiva está en tangente). Lo usan otros módulos.
   */
  async resolverPorProgresivaYVia(progresiva: number, via: TipoVia) {
    return this.repo.buscarPorProgresivaYVia(progresiva, via);
  }
}