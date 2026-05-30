import { EscenarioMTB } from '../../entities/escenario-mtb.entity';

/**
 * RESPONSE DTO de un escenario MTB.
 * No incluye los valores anuales (esos vienen por endpoint separado).
 */
export class EscenarioMtbResponseDto {
  id!: number;
  nombre!: string;
  descripcion!: string | null;

  /**
   * Indica si es el escenario protegido del sistema (mediciones reales).
   *
   * Viene del campo `es_real` de la BD — NO se calcula por nombre.
   * El usuario puede renombrar el escenario REAL a cualquier nombre
   * sin que este campo cambie.
   *
   * El frontend usa este campo para:
   *  - Mostrar el badge "REAL" vs "Proyección"
   *  - Deshabilitar el botón Eliminar
   */
  esReal!: boolean;

  // Auditoría visible
  creadoPor!: string;
  creadoEn!: Date;
  actualizadoEn!: Date;
  eliminado!: boolean;

  static fromEntity(e: EscenarioMTB): EscenarioMtbResponseDto {
    const dto = new EscenarioMtbResponseDto();
    dto.id            = e.id;
    dto.nombre        = e.nombre;
    dto.descripcion   = e.descripcion;
    dto.esReal        = e.esReal;   // ← campo real de BD, no e.nombre === 'REAL'
    dto.creadoPor     = e.creadoPor;
    dto.creadoEn      = e.creadoEn;
    dto.actualizadoEn = e.actualizadoEn;
    dto.eliminado     = e.eliminado;
    return dto;
  }
}