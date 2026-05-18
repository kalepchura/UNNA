import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AuditoriaBase } from '../../../common/entities/auditoria-base.entity';
import { UbicacionFalla, AccionFalla } from '../../../common/enums';
import { Cambiavia } from '../../catalogos/cambiavias/entities/cambiavia.entity';
import { ImagenFalla } from './imagen-falla.entity';

/**
 * ============================================================
 * FallaSoldaduraInox
 * ============================================================
 * Falla en la soldadura de un cambiavía.
 *
 * El usuario solo selecciona el cambiavía. Toda la información
 * geográfica (progresiva, vía, tramo, curvas, velocidad, norma)
 * se HEREDA del cambiavía vía el FK.
 *
 * No duplicamos esos campos en esta tabla: se accede por JOIN
 * cuando se necesitan (ej: en gráficos).
 *
 * Referencia: Informe sección 6.5.2.
 * ============================================================
 */
@Entity({ name: 'fallas_soldadura_inox' })
@Index('idx_fallas_sol_fecha', ['fechaDeteccion'])
@Index('idx_fallas_sol_accion', ['accion'])
export class FallaSoldaduraInox extends AuditoriaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  // ----------------------------------------------------------
  // RELACIÓN AL CAMBIAVÍA (lleva todo el contexto geográfico)
  // ----------------------------------------------------------

  @ManyToOne(() => Cambiavia, { eager: false })
  @JoinColumn({ name: 'cambiavia_id' })
  cambiavia!: Cambiavia;

  @Column({ name: 'cambiavia_id', type: 'integer' })
  cambiaviaId!: number;

  // ----------------------------------------------------------
  // CAMPOS PROPIOS
  // ----------------------------------------------------------

  @Column({ name: 'fecha_deteccion', type: 'date' })
  fechaDeteccion!: Date;

  @Column({
    name: 'ubicacion_falla',
    type: 'varchar',
    length: 15,
    enum: UbicacionFalla,
  })
  ubicacionFalla!: UbicacionFalla;

  @Column({
    name: 'accion',
    type: 'varchar',
    length: 20,
    enum: AccionFalla,
  })
  accion!: AccionFalla;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ name: 'ensayo', type: 'text', nullable: true })
  ensayo!: string | null;

  /** Código de ensayo (ej: PT-2024-001). Opcional. */
  @Column({ name: 'pt', type: 'varchar', length: 50, nullable: true })
  pt!: string | null;

  // ----------------------------------------------------------
  // RELACIÓN INVERSA: imágenes (1:N)
  // ----------------------------------------------------------

  /**
   * Lista de imágenes asociadas. NO se carga por defecto (eager:false).
   * Se carga explícitamente con relations: ['imagenes'] cuando se necesita.
   */
  @OneToMany(() => ImagenFalla, (img) => img.falla, {
    cascade: ['insert', 'update'],
  })
  imagenes!: ImagenFalla[];
}