import { Tramo } from '../entities/tramo.entity';

/**
 * ============================================================
 * TramoResponseDto
 * ============================================================
 * RESPONSE DTO. Es la forma del objeto Tramo que devolvemos
 * al frontend.
 *
 * En este caso es idéntico a la entidad, pero separarlo es
 * buena práctica:
 *  - Si mañana agregamos columnas internas a la entidad
 *    (ej: campos calculados o auditoría), no se filtran al frontend.
 *  - Permite agregar campos derivados solo de respuesta.
 * ============================================================
 */
export class TramoResponseDto {
  id!: number;
  codigo!: string;
  nombre!: string;
  progresivaInicio!: number;
  progresivaFin!: number;
  orden!: number;

  /**
   * Helper estático para construir el DTO desde una entidad.
   * Centraliza la conversión Entity → DTO en un solo lugar.
   */
  static fromEntity(tramo: Tramo): TramoResponseDto {
    const dto = new TramoResponseDto();
    dto.id = tramo.id;
    dto.codigo = tramo.codigo;
    dto.nombre = tramo.nombre;
    dto.progresivaInicio = tramo.progresivaInicio;
    dto.progresivaFin = tramo.progresivaFin;
    dto.orden = tramo.orden;
    return dto;
  }
}

/**
 * Formato de respuesta para listados paginados.
 * Aplica a cualquier listado del sistema (no solo tramos).
 *
 * Lo definimos genéricamente con <T> para reutilizarlo después.
 * Más adelante podríamos moverlo a `common/dto/`.
 */
export class PaginacionResponseDto<T> {
  data!: T[];           // Los registros de la página actual
  total!: number;       // Total de registros que matchean los filtros
  page!: number;        // Página actual
  limit!: number;       // Tamaño de página
  totalPages!: number;  // Total de páginas
}