import { EscenarioMTB } from '../../entities/escenario-mtb.entity';

/**
 * RESPONSE DTO de un escenario.
 * No incluye los valores anuales (esos vienen por endpoint separado en 3.20).
 */
export class EscenarioMtbResponseDto {
  id!: number;
  nombre!: string;
  descripcion!: string | null;

  /**
   * Indica si es el escenario protegido REAL.
   * Útil para que el frontend deshabilite acciones (eliminar, renombrar a REAL).
   */
  esReal!: boolean;

  // Auditoría visible
  creadoPor!: string;
  creadoEn!: Date;
  actualizadoEn!: Date;
  eliminado!: boolean;

  static fromEntity(e: EscenarioMTB): EscenarioMtbResponseDto {
    const dto = new EscenarioMtbResponseDto();
    dto.id = e.id;
    dto.nombre = e.nombre;
    dto.descripcion = e.descripcion;
    dto.esReal = e.nombre === 'REAL';
    dto.creadoPor = e.creadoPor;
    dto.creadoEn = e.creadoEn;
    dto.actualizadoEn = e.actualizadoEn;
    dto.eliminado = e.eliminado;
    return dto;
  }
}