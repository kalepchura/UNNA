import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FallaSoldaduraInox } from './falla-soldadura-inox.entity';

/**
 * ============================================================
 * ImagenFalla
 * ============================================================
 * Imágenes asociadas a una falla de soldadura.
 *
 * NO tiene soft delete propio: su visibilidad depende del estado
 * de la falla padre. Si la falla está eliminada, sus imágenes
 * tampoco se muestran (pero permanecen en BD y storage).
 *
 * Referencia: Informe sección 6.5.3.
 * ============================================================
 */
@Entity({ name: 'imagenes_falla' })
export class ImagenFalla {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Falla de soldadura padre. */
  @ManyToOne(() => FallaSoldaduraInox, (falla) => falla.imagenes, {
    onDelete: 'CASCADE', // si se borra la falla físicamente, las imágenes también
  })
  @JoinColumn({ name: 'falla_id' })
  falla!: FallaSoldaduraInox;

  @Column({ name: 'falla_id', type: 'integer' })
  fallaId!: number;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 255 })
  nombreArchivo!: string;

  /** Ruta en Supabase Storage. */
  @Column({ name: 'url_archivo', type: 'text' })
  urlArchivo!: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;
}