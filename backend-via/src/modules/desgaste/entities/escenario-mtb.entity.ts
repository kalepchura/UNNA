import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { AuditoriaBase } from '../../../common/entities/auditoria-base.entity';
import { MtbEscenario } from './mtb-escenario.entity';


/**
 * ============================================================
 * EscenarioMTB
 * ============================================================
 * Escenario de proyección de tráfico (MTB).
 *
 * Es la ÚNICA tabla del módulo Desgaste con AuditoriaBase
 * completa y soft delete restaurable.
 *
 * Hay un escenario especial llamado 'REAL' (constante
 * ESCENARIO_REAL_NOMBRE) que contiene los valores históricos
 * efectivamente registrados, no proyectados.
 *
 * Referencia: Informe sección 6.7.3.
 * ============================================================
 */
@Entity({ name: 'escenarios_mtb' })
export class EscenarioMTB extends AuditoriaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Nombre único. Ej: 'REAL', 'Escenario 1 - INCR 13.108%'. */
  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  @Index()
  nombre!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  /**
   * Valores anuales asociados al escenario.
   * Eager:false para no cargarlos por defecto en listados.
   */
  @OneToMany(() => MtbEscenario, (mtb) => mtb.escenario, {
    cascade: ['insert', 'update'],
  })
  valores!: MtbEscenario[];
}