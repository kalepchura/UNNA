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
import { TipoArchivoTemperatura } from '../../../common/enums';

import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { Temperatura } from './temperatura.entity';

/**
 * ============================================================
 * TemperaturaImportacion
 * ============================================================
 * Cabecera de cada archivo importado.
 *
 * El tramo se asigna AUTOMÁTICAMENTE al momento de la importación
 * a partir de la `progresiva` declarada por el usuario.
 *
 * Hereda AuditoriaBase: tiene soft delete. Cuando eliminado=true,
 * sus registros hijos en `temperaturas` quedan automáticamente
 * excluidos de gráficos/KPIs (las queries filtran por
 * imp.eliminado = false).
 *
 * Referencia: Informe sección 6.6.1.
 * ============================================================
 */
@Entity({ name: 'temperatura_importaciones' })
@Index('idx_temp_imp_tramo', ['tramoId'])
export class TemperaturaImportacion extends AuditoriaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Nombre original del archivo subido por el usuario. */
  @Column({
    name: 'nombre_archivo',
    type: 'varchar',
    length: 255,
  })
  nombreArchivo!: string;

  /** Progresiva del sensor en metros. La declara el usuario al subir. */
  @Column({
    name: 'progresiva',
    type: 'integer',
  })
  progresiva!: number;

  /** Tramo calculado automáticamente desde la progresiva. */
  @ManyToOne(() => Tramo, { eager: false })
  @JoinColumn({ name: 'tramo_id' })
  tramo!: Tramo;

  @Column({
    name: 'tramo_id',
    type: 'integer',
  })
  tramoId!: number;

  /** Tipo de archivo importado. */
  @Column({
    name: 'tipo_archivo',
    type: 'varchar',
    length: 10,
    enum: TipoArchivoTemperatura,
  })
  tipoArchivo!: TipoArchivoTemperatura;

  /** Comentario opcional del especialista al subir. */
  @Column({
    name: 'comentario_especialista',
    type: 'text',
    nullable: true,
  })
  comentarioEspecialista!: string | null;

  /**
   * Fecha de subida.
   * Por defecto now() en BD.
   */
  @Column({
    name: 'fecha_subida',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaSubida!: Date;

  /** Total de filas detectadas en el archivo. */
  @Column({
    name: 'total_registros',
    type: 'integer',
    default: 0,
  })
  totalRegistros!: number;

  /** Filas insertadas correctamente. */
  @Column({
    name: 'registros_validos',
    type: 'integer',
    default: 0,
  })
  registrosValidos!: number;

  /** Filas rechazadas por validación. */
  @Column({
    name: 'registros_invalidos',
    type: 'integer',
    default: 0,
  })
  registrosInvalidos!: number;

  /** Ruta del archivo original en Supabase Storage. */
  @Column({
    name: 'url_archivo',
    type: 'text',
    nullable: true,
  })
  urlArchivo!: string | null;

  /** Relación inversa: filas hijas. */
  @OneToMany(() => Temperatura, (t) => t.importacion)
  registros!: Temperatura[];
}