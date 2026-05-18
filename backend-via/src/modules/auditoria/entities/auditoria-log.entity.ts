import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';

/**
 * ============================================================
 * AuditoriaLog
 * ============================================================
 * Registro centralizado de cada operación relevante en el sistema.
 *
 * Cualquier service que cree, edite, elimine, restaure, importe
 * o haga carga masiva debe escribir aquí UNA fila.
 *
 * Esta tabla NUNCA se borra ni se edita. Es append-only.
 * Por eso no extiende AuditoriaBase ni tiene soft delete.
 *
 * Referencia: Informe sección 6.3.2.
 * ============================================================
 */
@Entity({ name: 'auditoria_log' })
export class AuditoriaLog {
  /** ID autoincremental (BIGSERIAL en Postgres). */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string; // bigint en Postgres llega como string a TS

  /** Módulo donde ocurrió la operación. */
  @Column({
    name: 'modulo',
    type: 'varchar',
    length: 30,
    enum: ModuloAuditoria,
  })
  @Index()
  modulo!: ModuloAuditoria;

  /**
   * Nombre lógico de la entidad afectada.
   * Ej: 'FallaRiel', 'EscenarioMTB', 'TemperaturaImportacion'.
   * Se guarda como string libre porque cada módulo decide su nombre.
   */
  @Column({ name: 'entidad', type: 'varchar', length: 60 })
  @Index()
  entidad!: string;

  /**
   * ID del registro afectado (como string, ya que pueden ser
   * UUIDs o números según la entidad).
   *
   * NULL en operaciones masivas (IMPORT, BULK_LOAD) que afectan
   * muchos registros sin uno único identificable.
   */
  @Column({ name: 'entidad_id', type: 'varchar', length: 60, nullable: true })
  entidadId!: string | null;

  /** Tipo de operación realizada. */
  @Column({
    name: 'operacion',
    type: 'varchar',
    length: 30,
    enum: OperacionAuditoria,
  })
  @Index()
  operacion!: OperacionAuditoria;

  /** UUID del usuario que ejecutó la operación. FK a usuarios_app. */
  @Column({ name: 'usuario_id', type: 'uuid' })
  @Index()
  usuarioId!: string;

  /**
   * Nombre del usuario al momento de la operación.
   * Se desnormaliza (se copia) para no tener que JOIN siempre y
   * para preservar el nombre histórico aunque el usuario cambie
   * de nombre en el futuro.
   */
  @Column({ name: 'usuario_nombre', type: 'varchar', length: 150 })
  usuarioNombre!: string;

  /**
   * Cantidad de registros afectados. Solo aplica en operaciones
   * masivas (IMPORT, BULK_LOAD). NULL en operaciones individuales.
   */
  @Column({ name: 'registros_afectados', type: 'integer', nullable: true })
  registrosAfectados!: number | null;

  /**
   * Información contextual flexible en formato JSON.
   * Cada módulo guarda lo que considera útil:
   *  - Fallas: { progresiva, via }
   *  - Temperatura: { archivo, año }
   *  - Desgaste: { año, trimestre }
   */
  @Column({ name: 'detalle', type: 'jsonb', nullable: true })
  detalle!: Record<string, any> | null;

  /** Timestamp exacto. Lo gestiona TypeORM al insertar. */
  @CreateDateColumn({ name: 'fecha', type: 'timestamptz' })
  @Index()
  fecha!: Date;
}