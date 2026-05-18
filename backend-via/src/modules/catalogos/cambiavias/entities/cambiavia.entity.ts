import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import {
  TipoVia, TipoCambiavia, NormaCambiavia, TipoAguja, Derivacion,
} from '../../../../common/enums';
import { Tramo } from '../../tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../curvas-verticales/entities/curva-vertical.entity';

/** Cambiavía de la línea (informe sección 6.4.6). */
@Entity({ name: 'cambiavias' })
export class Cambiavia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'codigo_bd', type: 'varchar', length: 50, unique: true })
  @Index()
  codigoBd!: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion!: string | null;

  @Column({ name: 'tipo', type: 'varchar', length: 10, enum: TipoCambiavia })
  tipo!: TipoCambiavia;

  @Column({ name: 'norma', type: 'varchar', length: 30, enum: NormaCambiavia })
  norma!: NormaCambiavia;

  @Column({ name: 'via', type: 'varchar', length: 10, enum: TipoVia })
  via!: TipoVia;

  @Column({ name: 'derivacion', type: 'varchar', length: 15, enum: Derivacion })
  derivacion!: Derivacion;

  @Column({ name: 'aguja_tipo', type: 'varchar', length: 10, enum: TipoAguja })
  agujaTipo!: TipoAguja;

  @Column({ name: 'progresiva', type: 'integer' })
  progresiva!: number;

  @ManyToOne(() => Tramo)
  @JoinColumn({ name: 'tramo_id' })
  tramo!: Tramo;

  @Column({ name: 'tramo_id', type: 'integer' })
  tramoId!: number;

  @ManyToOne(() => CurvaHorizontal, { nullable: true })
  @JoinColumn({ name: 'curva_horizontal_id' })
  curvaHorizontal!: CurvaHorizontal | null;

  @Column({ name: 'curva_horizontal_id', type: 'integer', nullable: true })
  curvaHorizontalId!: number | null;

  @ManyToOne(() => CurvaVertical, { nullable: true })
  @JoinColumn({ name: 'curva_vertical_id' })
  curvaVertical!: CurvaVertical | null;

  @Column({ name: 'curva_vertical_id', type: 'integer', nullable: true })
  curvaVerticalId!: number | null;

  @Column({ name: 'velocidad_kmh', type: 'integer' })
  velocidadKmh!: number;
}