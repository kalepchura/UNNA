import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tramo } from '../../tramos/entities/tramo.entity';


/**
 * Estación de la Línea 1 con su progresiva y tramo asociado.
 * Catálogo estático (informe sección 6.4.2).
 */
@Entity({ name: 'estaciones' })
export class Estacion {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Código corto. Ej: 'VES', 'PIN', 'CSC'. */
  @Column({ name: 'codigo', type: 'varchar', length: 10, unique: true })
  @Index()
  codigo!: string;

  /** Nombre oficial de la estación. */
  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  /** Progresiva exacta de la estación en metros. */
  @Column({ name: 'progresiva', type: 'integer' })
  progresiva!: number;

  /** Tramo al que pertenece (FK). */
  @ManyToOne(() => Tramo, { eager: false })
  @JoinColumn({ name: 'tramo_id' })
  tramo!: Tramo;

  /** Columna física del FK. Permite guardar/leer solo el id sin JOIN. */
  @Column({ name: 'tramo_id', type: 'integer' })
  tramoId!: number;

  /** Orden secuencial dentro de la línea. */
  @Column({ name: 'orden', type: 'integer' })
  orden!: number;
}