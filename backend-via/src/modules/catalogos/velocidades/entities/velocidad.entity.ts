import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/** Rango de velocidad máxima permitida (informe sección 6.4.5). */
@Entity({ name: 'velocidades' })
export class Velocidad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'progresiva_inicio', type: 'integer' })
  progresivaInicio!: number;

  @Column({ name: 'progresiva_fin', type: 'integer' })
  progresivaFin!: number;

  /** Velocidad máxima en km/h. */
  @Column({ name: 'velocidad_kmh', type: 'integer' })
  velocidadKmh!: number;
}