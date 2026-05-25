import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AuditoriaBase } from '../../../common/entities/auditoria-base.entity';
import { EstadoFalla, AccionRiel } from '../../../common/enums';
import { FallaRiel } from './falla-riel.entity';

/**
 * ============================================================
 * FallaRielAccion
 * ============================================================
 * Historial de intervenciones de mantenimiento sobre una FallaRiel.
 *
 * Cada fila representa un evento físico de gestión:
 *  - Programación de una intervención
 *  - Ejecución de una intervención
 *  - Cancelación, reasignación, etc.
 *
 * REGLA IMPORTANTE: una falla puede tener N acciones a lo largo
 * del tiempo. La acción MÁS RECIENTE (ordenada por fechaEjecucion
 * descendente, con id descendente como desempate) define el
 * estadoActual desnormalizado en FallaRiel.
 *
 * El frontend muestra el timeline completo en la vista de detalle,
 * componiendo el primer evento desde FallaRiel.fecha (detección)
 * y los siguientes desde esta tabla.
 *
 * Los gráficos NO leen esta tabla. Solo el detalle visual la usa.
 *
 * ============================================================
 * SINCRONIZACIÓN CON FallaRiel
 * ============================================================
 * Cada CREATE/UPDATE/DELETE en esta tabla DEBE pasar por
 * FallasRielAccionService, que recalcula y actualiza:
 *  - FallaRiel.estadoActual
 *  - FallaRiel.accionActual
 *  - FallaRiel.ptActual
 *  - FallaRiel.fechaEjecucionActual
 *
 * Nunca insertar/actualizar acciones por fuera del service, porque
 * el listado y los gráficos quedarían desincronizados.
 * ============================================================
 */
@Entity({ name: 'fallas_riel_acciones' })
@Index('idx_facc_falla_fecha', ['fallaId', 'fechaEjecucion'])
@Index('idx_facc_accion', ['accion'])
@Index('idx_facc_conclusion', ['conclusion'])
export class FallaRielAccion extends AuditoriaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  // ----------------------------------------------------------
  // RELACIÓN A LA FALLA PADRE
  // ----------------------------------------------------------

  @ManyToOne(() => FallaRiel, (f) => f.acciones, {
    eager: false,
    onDelete: 'CASCADE', // si se borra la falla, se borran sus acciones
  })
  @JoinColumn({ name: 'falla_id' })
  falla!: FallaRiel;

  @Column({ name: 'falla_id', type: 'integer' })
  fallaId!: number;

  // ----------------------------------------------------------
  // DATOS DE LA INTERVENCIÓN
  // ----------------------------------------------------------

  /**
   * Tipo de acción realizada (Esmerilado, Reemplazo, etc.).
   * Obligatorio: una acción sin tipo no tiene sentido conceptualmente.
   */
  @Column({
    name: 'accion',
    type: 'varchar',
    length: 30,
    enum: AccionRiel,
  })
  accion!: AccionRiel;

  /**
   * Código PT (orden de trabajo) que respalda la intervención.
   * Ej: "GYMF-1785461". Opcional porque a veces se programa antes
   * de tener el código asignado.
   */
  @Column({ name: 'pt', type: 'varchar', length: 50, nullable: true })
  pt!: string | null;

  /**
   * Fecha de ejecución (o programación).
   *
   * - Si conclusion=PROGRAMADO → es la fecha planeada
   * - Si conclusion=RESUELTO   → es la fecha real de ejecución
   * - Si conclusion=CANCELADO  → es la fecha de cancelación
   *
   * Opcional: una acción recién creada puede no tener fecha aún.
   * Se usa como criterio principal de orden cronológico en el timeline.
   * El campo creadoEn (auditoría) sirve como desempate cuando esta es null.
   */
  @Column({ name: 'fecha_ejecucion', type: 'date', nullable: true })
  fechaEjecucion!: Date | null;

  /**
   * Estado/conclusión de la acción.
   * Es el mismo enum que FallaRiel.estadoActual: una acción
   * RESUELTA pone la falla en estado RESUELTO, etc.
   */
  @Column({
    name: 'conclusion',
    type: 'varchar',
    length: 20,
    enum: EstadoFalla,
  })
  conclusion!: EstadoFalla;

  /** Observaciones libres del técnico/jefe sobre la intervención. */
  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones!: string | null;
}