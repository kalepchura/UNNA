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
 * El campo `esReal` identifica el escenario histórico del sistema.
 * Es un flag en BD — NO depende del nombre. El usuario puede
 * renombrar el escenario REAL libremente sin perder su protección.
 *
 * Reglas sobre esReal = true:
 *  - No se puede eliminar (soft delete bloqueado en el service)
 *  - Solo existe uno en la tabla (garantizado por el seed)
 *  - Nombre y descripción se pueden editar libremente
 *
 * Referencia: Informe sección 6.7.3.
 * ============================================================
 */
@Entity({ name: 'escenarios_mtb' })
export class EscenarioMTB extends AuditoriaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Nombre único. Editable libremente, incluso para el escenario REAL.
   * Ej: 'REAL', 'Mediciones históricas', 'Escenario 1 - INCR 13.108%'.
   */
  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  @Index()
  nombre!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  /**
   * Identifica el escenario histórico del sistema.
   *  - true  → escenario REAL (no eliminable, único en la tabla)
   *  - false → escenario de proyección (gestionable libremente)
   *
   * Este campo NO cambia nunca después del seed inicial.
   * Es la fuente de verdad para todas las protecciones del sistema.
   * No depende del nombre — el usuario puede renombrar el REAL libremente.
   */
  @Column({ name: 'es_real', type: 'boolean', default: false })
  esReal!: boolean;

  /**
   * Valores anuales asociados al escenario.
   * Eager: false para no cargarlos por defecto en listados.
   */
  @OneToMany(() => MtbEscenario, (mtb) => mtb.escenario, {
    cascade: ['insert', 'update'],
  })
  valores!: MtbEscenario[];
}