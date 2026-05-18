import { Temperatura } from '../entities/temperatura.entity';

/**
 * RESPONSE DTO de una fila individual de temperatura.
 * La temperatura viene como string desde Postgres (NUMERIC), la
 * convertimos a number para que el frontend trabaje con ella
 * cómodamente.
 */
export class TemperaturaResponseDto {
  id!: string; // bigint → string
  fecha!: Date;
  hora!: string; // 'HH:mm:ss'
  temperatura!: number;
  importacionId!: number;
  creadoEn!: Date;

  static fromEntity(t: Temperatura): TemperaturaResponseDto {
    const dto = new TemperaturaResponseDto();
    dto.id = String(t.id);
    dto.fecha = t.fecha;
    dto.hora = t.hora;
    dto.temperatura = parseFloat(t.temperatura);
    dto.importacionId = t.importacionId;
    dto.creadoEn = t.creadoEn;
    return dto;
  }
}