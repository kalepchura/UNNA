import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { EscenarioMTB } from './escenario-mtb.entity';

/**
 * ============================================================
 * MtbEscenario
 * ============================================================
 * Valores anuales de MTB (millones de toneladas brutas) de un
 * escenario específico.
 *
 * Su ciclo de vida depende del escenario padre:
 *  - Si el escenario se elimina FÍSICAMENTE: cascada (raro en
 *    flujo normal porque usamos soft delete).
 *  - Si el escenario tiene eliminado=true: estos valores NO se
 *    consideran en gráficos (las queries filtran por
 *    esc.eliminado = false).
 *
 * UNIQUE(escenario_id, anio): un escenario solo puede tener
 * UN valor por año.
 *
 * Referencia: Informe sección 6.7.4.
 * ============================================================
 */
@Entity({ name: 'mtb_escenario' })
@Unique('uq_mtb_escenario_anio', ['escenarioId', 'anio'])
@Index('idx_mtb_escenario', ['escenarioId'])
export class MtbEscenario {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Escenario padre. ON DELETE CASCADE para limpieza física. */
  @ManyToOne(() => EscenarioMTB, (esc) => esc.valores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'escenario_id' })
  escenario!: EscenarioMTB;

  @Column({ name: 'escenario_id', type: 'integer' })
  escenarioId!: number;

  /** Año entre 2012 y 2100 (validación a nivel DTO + service). */
  @Column({ name: 'anio', type: 'integer' })
  anio!: number;

  /**
   * Valor MTB anual en millones de toneladas.
   * NUMERIC(10,3) → string en TS por precisión.
   */
  @Column({
    name: 'mtb',
    type: 'numeric',
    precision: 10,
    scale: 3,
  })
  mtb!: string;
}