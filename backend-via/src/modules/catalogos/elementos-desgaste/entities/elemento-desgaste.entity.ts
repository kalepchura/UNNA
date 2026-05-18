import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import {
  TipoVia, LadoRiel, PerfilRiel, CarrilCurva,
} from '../../../../common/enums';
import { Tramo } from '../../tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../curvas-verticales/entities/curva-vertical.entity';

/**
 * Punto fijo de medición de desgaste (informe sección 6.7.1).
 * Son 278 elementos en la línea principal.
 */
@Entity({ name: 'elementos_desgaste' })
export class ElementoDesgaste {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Código numérico usado en campo. */
  @Column({ name: 'codigo_elemento', type: 'integer', unique: true })
  @Index()
  codigoElemento!: number;

  @Column({ name: 'progresiva', type: 'integer' })
  progresiva!: number;

  @Column({ name: 'via', type: 'varchar', length: 10, enum: TipoVia })
  via!: TipoVia;

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

  @Column({ name: 'riel', type: 'varchar', length: 15, enum: LadoRiel })
  riel!: LadoRiel;

  @Column({ name: 'perfil', type: 'varchar', length: 10, enum: PerfilRiel })
  perfil!: PerfilRiel;

  @Column({ name: 'carril_curva', type: 'varchar', length: 10, enum: CarrilCurva })
  carrilCurva!: CarrilCurva;
}