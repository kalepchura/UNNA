import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { TipoVia } from '../../../../common/enums';
import { Estacion } from '../../estaciones/entities/estacion.entity';

/**
 * Curva horizontal definida por vía y rango de progresivas.
 * Catálogo estático (informe sección 6.4.3).
 */
@Entity({ name: 'curvas_horizontales' })
export class CurvaHorizontal {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Código/nombre de la curva. Ej: 'CH-01'. */
  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  nombre!: string;

  /** Vía a la que aplica la curva. */
  @Column({ name: 'via', type: 'varchar', length: 10, enum: TipoVia })
  via!: TipoVia;

  /** Radio en metros (puede ser null si no se conoce). */
  @Column({ name: 'radio', type: 'numeric', precision: 8, scale: 2, nullable: true })
  radio!: number | null;

  @Column({ name: 'inicio_m', type: 'integer' })
  inicioM!: number;

  @Column({ name: 'fin_m', type: 'integer' })
  finM!: number;

  /** Peralte en mm. */
  @Column({ name: 'peralte', type: 'numeric', precision: 6, scale: 2, nullable: true })
  peralte!: number | null;

  /** Estación de inicio (FK opcional). */
  @ManyToOne(() => Estacion, { nullable: true })
  @JoinColumn({ name: 'estacion_inicio_id' })
  estacionInicio!: Estacion | null;

  @Column({ name: 'estacion_inicio_id', type: 'integer', nullable: true })
  estacionInicioId!: number | null;

  /** Estación de fin (FK opcional). */
  @ManyToOne(() => Estacion, { nullable: true })
  @JoinColumn({ name: 'estacion_fin_id' })
  estacionFin!: Estacion | null;

  @Column({ name: 'estacion_fin_id', type: 'integer', nullable: true })
  estacionFinId!: number | null;
}