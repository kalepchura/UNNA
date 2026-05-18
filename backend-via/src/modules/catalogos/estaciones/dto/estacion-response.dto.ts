import { Estacion } from '../entities/estacion.entity';

export class EstacionResponseDto {
  id!: number;
  codigo!: string;
  nombre!: string;
  progresiva!: number;
  tramoId!: number;
  /** Nombre del tramo (si se cargó por JOIN). Útil para mostrar sin id. */
  tramoCodigo?: string;
  orden!: number;

  static fromEntity(e: Estacion): EstacionResponseDto {
    const dto = new EstacionResponseDto();
    dto.id = e.id;
    dto.codigo = e.codigo;
    dto.nombre = e.nombre;
    dto.progresiva = e.progresiva;
    dto.tramoId = e.tramoId;
    dto.tramoCodigo = e.tramo?.codigo;
    dto.orden = e.orden;
    return dto;
  }
}