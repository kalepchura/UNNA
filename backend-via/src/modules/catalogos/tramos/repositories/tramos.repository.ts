import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tramo } from '../entities/tramo.entity';
import { FiltrarTramosDto } from '../dto/filtrar-tramos.dto';

/**
 * ============================================================
 * TramosRepository
 * ============================================================
 * Capa de acceso a datos para la entidad Tramo.
 * Encapsula todas las queries a la BD.
 *
 * El service NO debe usar `Repository<Tramo>` directamente,
 * siempre llama a este repository.
 * ============================================================
 */
@Injectable()
export class TramosRepository {
  constructor(
    // Inyectamos el repository genérico de TypeORM para Tramo.
    // Es como pedirle a NestJS "dame el ayudante de TypeORM
    // que ya sabe hablar con la tabla tramos".
    @InjectRepository(Tramo)
    private readonly repo: Repository<Tramo>,
  ) {}

  /**
   * Lista tramos con filtros y paginación.
   * Devuelve [registros, total] (tupla de TypeORM).
   */
  // ✅ Para la TABLA (todos los campos)
  async listarParaTabla(filtros: FiltrarTramosDto): Promise<Tramo[]> {
    const { limit = 1000 } = filtros;
    return this.repo.find({
      order: { orden: 'ASC' },
      take: limit,
    });
  }

  /**
   * Busca un tramo por su id interno.
   * Devuelve null si no existe (no lanza error, eso lo hace el service).
   */
  async buscarPorId(id: number): Promise<Tramo | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Busca un tramo por su código operativo.
   * Útil para validar duplicados al crear.
   */
  async buscarPorCodigo(codigo: string): Promise<Tramo | null> {
    return this.repo.findOne({ where: { codigo } });
  }

  /**
   * Busca el tramo cuya progresiva está dentro de su rango.
   * Lo necesitarán otros módulos (Fallas, Temperatura) para
   * calcular automáticamente el tramo a partir de una progresiva.
   *
   * SQL equivalente:
   *   SELECT * FROM tramos
   *   WHERE progresiva_inicio <= :p AND progresiva_fin >= :p
   *   LIMIT 1;
   */
  // ✅ Para otros módulos (Fallas, Temperatura)
  async buscarPorProgresiva(progresiva: number): Promise<Tramo | null> {
    return this.repo
      .createQueryBuilder('tramo')
      .where('tramo.progresiva_inicio <= :p', { p: progresiva })
      .andWhere('tramo.progresiva_fin >= :p', { p: progresiva })
      .getOne();
  }
  /**
   * Devuelve solo {id, codigo, nombre} para alimentar dropdowns
   * de filtro en el frontend. Más liviano que traer toda la entidad.
   *
   * Lo usaremos cuando otros módulos necesiten "lista de tramos
   * para el filtro".
   */
  async listarParaFiltro(): Promise<{ id: number; codigo: string; nombre: string }[]> {
    return this.repo
      .createQueryBuilder('tramo')
      .select(['tramo.id', 'tramo.codigo', 'tramo.nombre'])
      .orderBy('tramo.orden', 'ASC')
      .getMany();
  }

  async listarTodos(): Promise<Tramo[]> {
    return this.repo.find({
      order: {
        orden: 'ASC',
      },
    });
  }


  // ✅ Para el SELECTOR (solo id y codigo)
  async listarParaSelector(): Promise<{ id: number; codigo: string }[]> {
    return this.repo.find({
      select: ['id', 'codigo'],
      order: { orden: 'ASC' },
    });
  }

  
}
