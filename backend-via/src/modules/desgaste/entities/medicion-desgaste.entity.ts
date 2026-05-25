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
import { EscenarioMTB } from './escenario-mtb.entity';

@Entity({ name: 'mediciones_desgaste' })
@Unique('uq_medicion_elemento_escenario_anio_trim', [
  'elementoId',
  'escenarioId',
  'anio',
  'trimestre',
])
@Index('idx_med_anio', ['anio'])
@Index('idx_med_elem_anio', ['elementoId', 'anio'])
@Index('idx_med_escenario', ['escenarioId'])
export class MedicionDesgaste {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ElementoDesgaste, { eager: false })
  @JoinColumn({ name: 'elemento_id' })
  elemento!: ElementoDesgaste;

  @Column({ name: 'elemento_id', type: 'integer' })
  elementoId!: number;

  /** Escenario al que pertenece esta medición. */
  @ManyToOne(() => EscenarioMTB, { eager: false })
  @JoinColumn({ name: 'escenario_id' })
  escenario!: EscenarioMTB;

  @Column({ name: 'escenario_id', type: 'integer' })
  escenarioId!: number;

  @Column({ name: 'anio', type: 'integer' })
  anio!: number;

  @Column({ name: 'trimestre', type: 'integer' })
  trimestre!: number;

  @Column({ name: 'w1', type: 'numeric', precision: 5, scale: 2, nullable: true })
  w1!: string | null;

  @Column({ name: 'w2', type: 'numeric', precision: 5, scale: 2, nullable: true })
  w2!: string | null;

  @Column({ name: 'w3r', type: 'numeric', precision: 5, scale: 2, nullable: true })
  w3r!: string | null;

  @Column({ name: 'w3l', type: 'numeric', precision: 5, scale: 2, nullable: true })
  w3l!: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;
}