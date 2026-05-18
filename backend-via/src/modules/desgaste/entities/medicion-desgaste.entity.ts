import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { ElementoDesgaste } from '../../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';

/**
 * ============================================================
 * MedicionDesgaste
 * ============================================================
 * Una medición de desgaste por elemento, año y trimestre.
 *
 * Cada registro contiene 4 valores (W1, W2, W3R, W3L) que son
 * INDEPENDIENTES y pueden ser null por separado (es válido tener
 * solo W1 medido en un trimestre).
 *
 * NO tiene auditoría ni soft delete propios. La auditoría se
 * registra a nivel de SESIÓN DE CARGA (un BULK_LOAD por sesión)
 * con la cantidad de celdas modificadas.
 *
 * Restricción: UNIQUE(elemento_id, anio, trimestre) garantiza
 * que existe un único registro por celda lógica de la grilla.
 *
 * Referencia: Informe sección 6.7.2.
 * ============================================================
 */
@Entity({ name: 'mediciones_desgaste' })
@Unique('uq_medicion_elemento_anio_trim', ['elementoId', 'anio', 'trimestre'])
@Index('idx_med_anio', ['anio']) // KPIs y gráficos filtran por año
@Index('idx_med_elem_anio', ['elementoId', 'anio']) // queries por elemento
export class MedicionDesgaste {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Elemento medido. FK a elementos_desgaste. */
  @ManyToOne(() => ElementoDesgaste, { eager: false })
  @JoinColumn({ name: 'elemento_id' })
  elemento!: ElementoDesgaste;

  @Column({ name: 'elemento_id', type: 'integer' })
  elementoId!: number;

  /** Año de la medición. */
  @Column({ name: 'anio', type: 'integer' })
  anio!: number;

  /** Trimestre 1-4 (validado a nivel BD con CHECK). */
  @Column({ name: 'trimestre', type: 'integer' })
  trimestre!: number;

  /**
   * Desgaste W1 en mm. NUMERIC(5,2) → string en TS (precisión).
   * Null si no se midió W1 en este trimestre.
   */
  @Column({
    name: 'w1',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  w1!: string | null;

  @Column({
    name: 'w2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  w2!: string | null;

  @Column({
    name: 'w3r',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  w3r!: string | null;

  @Column({
    name: 'w3l',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  w3l!: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;
}