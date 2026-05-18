import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AuditoriaBase } from '../../../common/entities/auditoria-base.entity';
import { TipoVia, LadoRiel } from '../../../common/enums';
import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../catalogos/curvas-verticales/entities/curva-vertical.entity';

/**
 * ============================================================
 * FallaRiel
 * ============================================================
 * Falla detectada directamente en el riel.
 *
 * Al crear/actualizar, el backend calcula automáticamente:
 *  - tramoId (obligatorio)
 *  - curvaHorizontalId (opcional)
 *  - curvaVerticalId (opcional)
 *  - velocidadKmh (opcional)
 *
 * a partir de (progresiva, via). Por eso esos campos no llegan
 * desde el frontend en el DTO de creación.
 *
 * Referencia: Informe sección 6.5.1.
 * ============================================================
 */
@Entity({ name: 'fallas_riel' })
// Índices compuestos para acelerar queries de gráficos
@Index('idx_fallas_riel_fecha_via', ['fecha', 'via'])
@Index('idx_fallas_riel_tramo_fecha', ['tramoId', 'fecha'])
export class FallaRiel extends AuditoriaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  // ----------------------------------------------------------
  // CAMPOS QUE LLENA EL USUARIO
  // ----------------------------------------------------------

  /** Progresiva en metros desde el origen. */
  @Column({ name: 'progresiva', type: 'integer' })
  @Index()
  progresiva!: number;

  /** Vía donde ocurrió la falla. */
  @Column({ name: 'via', type: 'varchar', length: 10, enum: TipoVia })
  via!: TipoVia;

  /** Fecha de detección de la falla. */
  @Column({ name: 'fecha', type: 'date' })
  @Index()
  fecha!: Date;

  /** Lado del riel afectado. */
  @Column({ name: 'carril', type: 'varchar', length: 15, enum: LadoRiel })
  carril!: LadoRiel;

  /** Causa libre (texto). Opcional. */
  @Column({ name: 'causa', type: 'text', nullable: true })
  causa!: string | null;

  /** Origen o antecedente (texto). Opcional. */
  @Column({ name: 'origen', type: 'text', nullable: true })
  origen!: string | null;

  // ----------------------------------------------------------
  // CAMPOS CALCULADOS POR EL BACKEND
  // ----------------------------------------------------------

  /** Velocidad máxima en km/h, calculada desde el catálogo. */
  @Column({ name: 'velocidad_kmh', type: 'integer', nullable: true })
  velocidadKmh!: number | null;

  @ManyToOne(() => Tramo, { eager: false })
  @JoinColumn({ name: 'tramo_id' })
  tramo!: Tramo;

  @Column({ name: 'tramo_id', type: 'integer' })
  tramoId!: number;

  @ManyToOne(() => CurvaHorizontal, { eager: false, nullable: true })
  @JoinColumn({ name: 'curva_horizontal_id' })
  curvaHorizontal!: CurvaHorizontal | null;

  @Column({ name: 'curva_horizontal_id', type: 'integer', nullable: true })
  curvaHorizontalId!: number | null;

  @ManyToOne(() => CurvaVertical, { eager: false, nullable: true })
  @JoinColumn({ name: 'curva_vertical_id' })
  curvaVertical!: CurvaVertical | null;

  @Column({ name: 'curva_vertical_id', type: 'integer', nullable: true })
  curvaVerticalId!: number | null;

  // ----------------------------------------------------------
  // ARCHIVOS (Supabase Storage) — opcional, máx 1 de cada
  // ----------------------------------------------------------

  @Column({ name: 'nombre_informe_interno', type: 'varchar', length: 255, nullable: true })
  nombreInformeInterno!: string | null;

  @Column({ name: 'url_informe_interno', type: 'text', nullable: true })
  urlInformeInterno!: string | null;

  @Column({ name: 'nombre_informe_externo', type: 'varchar', length: 255, nullable: true })
  nombreInformeExterno!: string | null;

  @Column({ name: 'url_informe_externo', type: 'text', nullable: true })
  urlInformeExterno!: string | null;
}