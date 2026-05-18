import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TipoVia } from '../../../../common/enums';

/** Curva vertical (informe sección 6.4.4). */
@Entity({ name: 'curvas_verticales' })
export class CurvaVertical {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ name: 'via', type: 'varchar', length: 10, enum: TipoVia })
  via!: TipoVia;

  @Column({ name: 'inicio_m', type: 'integer' })
  inicioM!: number;

  @Column({ name: 'fin_m', type: 'integer' })
  finM!: number;

  /** Punto vértice (PK). */
  @Column({ name: 'pk_vertice', type: 'integer', nullable: true })
  pkVertice!: number | null;

  /** Pendiente entrada en milésimas (‰). */
  @Column({ name: 'pendiente_entrada', type: 'numeric', precision: 6, scale: 3, nullable: true })
  pendienteEntrada!: number | null;

  @Column({ name: 'pendiente_salida', type: 'numeric', precision: 6, scale: 3, nullable: true })
  pendienteSalida!: number | null;

  @Column({ name: 'radio', type: 'numeric', precision: 10, scale: 2, nullable: true })
  radio!: number | null;
}