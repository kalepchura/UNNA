import { Injectable, NotFoundException } from '@nestjs/common';
import { TramosRepository } from '../repositories/tramos.repository';
import { FiltrarTramosDto } from '../dto/filtrar-tramos.dto';
import {
  TramoResponseDto,
  PaginacionResponseDto,
} from '../dto/tramo-response.dto';
import { Tramo } from '../entities/tramo.entity';

/**
 * ============================================================
 * TramosService
 * ============================================================
 * Lógica de negocio del catálogo Tramos.
 *
 * Como Tramos es un catálogo INMUTABLE desde la API, este
 * service solo expone métodos de LECTURA. La carga inicial
 * de datos se hace por seed (ver scripts/seed.ts).
 *
 * Otros módulos del sistema (Fallas, Temperatura, Desgaste)
 * dependerán de este service para resolver tramos por
 * progresiva, código o id.
 * ============================================================
 */
@Injectable()
export class TramosService {
  constructor(
    // Inyectamos nuestro repository custom (no el de TypeORM directo).
    // Esto mantiene la separación de capas que pide el informe.
    private readonly tramosRepo: TramosRepository,
  ) {}

  // ----------------------------------------------------------
  // MÉTODOS PARA EL CONTROLLER (HTTP)
  // ----------------------------------------------------------

  // ✅ Para la TABLA
  async listarParaTabla(filtros: FiltrarTramosDto): Promise<TramoResponseDto[]> {
    const tramos = await this.tramosRepo.listarParaTabla(filtros);
    return tramos.map((t) => TramoResponseDto.fromEntity(t));
  }

   // ✅ Para el SELECTOR
  async listarParaSelector(): Promise<{ id: number; codigo: string }[]> {
    return this.tramosRepo.listarParaSelector();
  }

  /**
   * Busca un tramo por id. Lanza 404 si no existe.
   */
  async obtenerPorId(id: number): Promise<TramoResponseDto> {
    const tramo = await this.tramosRepo.buscarPorId(id);
    if (!tramo) {
      throw new NotFoundException(`Tramo con id ${id} no encontrado`);
    }
    return TramoResponseDto.fromEntity(tramo);
  }

  /**
   * Lista resumida {id, codigo, nombre} para alimentar dropdowns
   * de filtros en el frontend (ej: filtro de tramo en módulo Fallas).
   *
   * No paginado: los catálogos son chicos, traemos todo.
   */
  async listarParaFiltro() {
    return this.tramosRepo.listarParaFiltro();
  }

  // ----------------------------------------------------------
  // MÉTODOS DE DOMINIO (usados por OTROS módulos)
  // ----------------------------------------------------------
  // Estos no se exponen como endpoints, los consumen otros
  // services del sistema.

  /**
   * Resuelve qué tramo contiene una progresiva específica.
   * Lo usarán Fallas y Temperatura para cálculo automático.
   *
   * Devuelve la entidad completa (no DTO) porque es uso interno.
   * Lanza 404 si la progresiva no cae en ningún tramo.
   */
  async resolverPorProgresiva(progresiva: number): Promise<Tramo> {
    const tramo = await this.tramosRepo.buscarPorProgresiva(progresiva);
    if (!tramo) {
      throw new NotFoundException(`La progresiva ${progresiva} no pertenece a ningún tramo`);
    }
    return tramo;
  }

  /**
   * Resuelve un tramo por su código operativo.
   * Útil cuando el frontend manda el código (no el id).
   */
  async resolverPorCodigo(codigo: string): Promise<Tramo> {
    const tramo = await this.tramosRepo.buscarPorCodigo(codigo);
    if (!tramo) {
      throw new NotFoundException(`Tramo con código '${codigo}' no encontrado`);
    }
    return tramo;
  }


  async listarTodos(): Promise<Tramo[]> {
    return this.tramosRepo.listarTodos();
  }

}