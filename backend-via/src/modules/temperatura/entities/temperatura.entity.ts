import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TemperaturaImportacion } from './temperatura-importacion.entity';

/**
 * ============================================================
 * Temperatura
 * ============================================================
 * Lectura individual de temperatura. Tabla de mayor volumen
 * del sistema.
 *
 * INMUTABLE: una vez insertada, no se modifica.
 * NO tiene soft delete propio: su visibilidad depende de la
 * importación padre. Se filtra siempre por imp.eliminado=false.
 *
 * Si se elimina FÍSICAMENTE la importación (no soft delete),
 * los registros se borran en cascada por la FK ON DELETE CASCADE.
 *
 * Referencia: Informe sección 6.6.2.
 * ============================================================
 */
@Entity({ name: 'temperaturas' })
// Índices según informe sección 6.6.2
@Index('idx_temp_imp_fecha', ['importacionId', 'fecha'])  // Consultas por archivo
@Index('idx_temp_fecha_hora', ['fecha', 'hora'])          // Patrón horario (G3)
@Index('idx_temp_fecha', ['fecha'])                        // KPIs últimos N días
export class Temperatura {
  /**
   * BIGSERIAL en Postgres (entero de 64 bits).
   * Se mapea como string en TS porque Number JS no puede
   * representar todos los bigint con precisión.
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha!: Date;

  /**
   * Hora de la lectura. PostgreSQL TIME se mapea como string en TS
   * (formato 'HH:mm:ss').
   */
  @Column({ name: 'hora', type: 'time' })
  hora!: string;

  /**
   * Temperatura en grados Celsius.
   * NUMERIC(5,2) llega como string desde Postgres en TypeORM.
   * El service convierte a number cuando es necesario.
   */
  @Column({
    name: 'temperatura',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  temperatura!: string; // se trata como string por la precisión decimal

  /**
   * FK al archivo de origen.
   * onDelete: 'CASCADE' borra registros si se borra físicamente
   * la importación. En flujo normal NO se borra físicamente: se
   * usa soft delete (eliminado=true en imp).
   */
  @ManyToOne(() => TemperaturaImportacion, (imp) => imp.registros, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'importacion_id' })
  importacion!: TemperaturaImportacion;

  @Column({ name: 'importacion_id', type: 'integer' })
  importacionId!: number;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;
}