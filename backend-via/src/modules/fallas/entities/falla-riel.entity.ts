import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { AuditoriaBase } from '../../../common/entities/auditoria-base.entity';
import {
  TipoVia,
  LadoRiel,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
  EstadoFalla,
  AccionRiel,
} from '../../../common/enums';
import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../catalogos/curvas-verticales/entities/curva-vertical.entity';
import { FallaRielAccion } from './falla-riel-accion.entity';

/**
 * ============================================================
 * FallaRiel
 * ============================================================
 * Falla detectada directamente en el riel (vía corrida).
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
 * ============================================================
 * FASE 2 — EXTENSIÓN
 * ============================================================
 * Se agregaron campos descriptivos del defecto (todos opcionales)
 * y un bloque de "estado actual" desnormalizado que refleja la
 * última acción registrada en FallaRielAccion.
 *
 * Los campos descriptivos usan enums con valor SIN_DEFINIR como
 * default (patrón Null Object) en vez de columnas nullable,
 * porque facilita gráficos y queries (sin IS NULL).
 *
 * El bloque "estado actual" se sincroniza automáticamente desde
 * el FallasRielAccionService cuando se crea/edita/elimina una acción.
 * Nunca se debería actualizar manualmente desde fuera de ese servicio.
 *
 * Referencia: Informe sección 6.5.1.
 * ============================================================
 */
@Entity({ name: 'fallas_riel' })
// Índices compuestos para acelerar queries de gráficos
@Index('idx_fallas_riel_fecha_via', ['fecha', 'via'])
@Index('idx_fallas_riel_tramo_fecha', ['tramoId', 'fecha'])
// Índices para los nuevos filtros analíticos (Fase 2.D)
@Index('idx_fallas_riel_tipo_defecto', ['tipoDefecto'])
@Index('idx_fallas_riel_elemento', ['elementoAfectado'])
@Index('idx_fallas_riel_estado_actual', ['estadoActual'])
export class FallaRiel extends AuditoriaBase {
  @PrimaryGeneratedColumn()
  id!: number;

  // ----------------------------------------------------------
  // CAMPOS QUE LLENA EL USUARIO (los originales)
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
  // FASE 2 — CARACTERIZACIÓN DEL DEFECTO (enums con SIN_DEFINIR)
  // ----------------------------------------------------------

  /** Tipo de defecto físico (Astillamiento, Squat, etc.). */
  @Column({
    name: 'tipo_defecto',
    type: 'varchar',
    length: 30,
    enum: TipoDefectoRiel,
    default: TipoDefectoRiel.SIN_DEFINIR,
  })
  tipoDefecto!: TipoDefectoRiel;

  /** Elemento físico afectado (Barra, Soldadura Electrofusión, etc.). */
  @Column({
    name: 'elemento_afectado',
    type: 'varchar',
    length: 30,
    enum: ElementoAfectadoRiel,
    default: ElementoAfectadoRiel.SIN_DEFINIR,
  })
  elementoAfectado!: ElementoAfectadoRiel;

  /** Zona del perfil del riel (Banda rodadura, Hongo, Alma, etc.). */
  @Column({
    name: 'zona_afectada',
    type: 'varchar',
    length: 20,
    enum: ZonaAfectadaRiel,
    default: ZonaAfectadaRiel.SIN_DEFINIR,
  })
  zonaAfectada!: ZonaAfectadaRiel;

  /** Perfil técnico del riel (115RE, 100RE, ASCE75, etc.). */
  @Column({
    name: 'perfil',
    type: 'varchar',
    length: 15,
    enum: PerfilFallaRiel,
    default: PerfilFallaRiel.SIN_DEFINIR,
  })
  perfil!: PerfilFallaRiel;

  /**
   * Indicador ALTA/BAJA cuando la falla está en curva.
   * NO_APLICA por default (tangentes).
   */
  @Column({
    name: 'alta_baja',
    type: 'varchar',
    length: 15,
    enum: AltaBaja,
    default: AltaBaja.NO_APLICA,
  })
  altaBaja!: AltaBaja;

  // ----------------------------------------------------------
  // FASE 2 — MEDIDAS DEL DEFECTO (numéricos opcionales)
  // ----------------------------------------------------------

  /**
   * Progresiva final del defecto en metros.
   * Si el defecto abarca un tramo (ej: 4689 a 4886).
   * Si es puntual, queda null.
   */
  @Column({ name: 'progresiva_final', type: 'integer', nullable: true })
  progresivaFinal!: number | null;

  /** Largo del defecto en milímetros. */
  @Column({ name: 'largo_mm', type: 'numeric', precision: 8, scale: 2, nullable: true })
  largo!: number | null;

  /** Ancho del defecto en milímetros. */
  @Column({ name: 'ancho_mm', type: 'numeric', precision: 8, scale: 2, nullable: true })
  ancho!: number | null;

  /** Profundidad del defecto en milímetros. */
  @Column({ name: 'profundidad_mm', type: 'numeric', precision: 8, scale: 2, nullable: true })
  profundidad!: number | null;

  /**
   * Número correlativo de foto en el reporte original.
   * Es solo trazabilidad del registro físico, no es FK ni referencia.
   */
  @Column({ name: 'numero_foto', type: 'integer', nullable: true })
  numeroFoto!: number | null;

  /**
   * Tipo de ondulación cuando aplica (texto libre).
   * No es enum porque los valores son muy variables y la mayoría
   * de fallas vienen sin este dato.
   */
  @Column({ name: 'tipo_onda', type: 'varchar', length: 100, nullable: true })
  tipoOnda!: string | null;

  // ----------------------------------------------------------
  // FASE 2 — ESTADO DESNORMALIZADO (reflejo de última acción)
  // ----------------------------------------------------------
  // ⚠️ Estos campos NO se editan manualmente. Los sincroniza
  // FallasRielAccionService cada vez que se crea, edita o
  // elimina una FallaRielAccion. Permite que el listado y los
  // gráficos lean el estado sin hacer JOIN al historial.
  // ----------------------------------------------------------

  /**
   * Estado actual de la falla (refleja la última acción registrada).
   * NO_ATENDIDO cuando la falla recién se crea (sin acciones).
   */
  @Column({
    name: 'estado_actual',
    type: 'varchar',
    length: 20,
    enum: EstadoFalla,
    default: EstadoFalla.NO_ATENDIDO,
  })
  estadoActual!: EstadoFalla;

  /**
   * Última acción registrada para esta falla.
   * Null cuando aún no se ha programado ninguna intervención.
   */
  @Column({
    name: 'accion_actual',
    type: 'varchar',
    length: 30,
    enum: AccionRiel,
    nullable: true,
  })
  accionActual!: AccionRiel | null;

  /** Código PT (orden de trabajo) de la acción más reciente. */
  @Column({ name: 'pt_actual', type: 'varchar', length: 50, nullable: true })
  ptActual!: string | null;

  /** Fecha de ejecución de la acción más reciente. */
  @Column({ name: 'fecha_ejecucion_actual', type: 'date', nullable: true })
  fechaEjecucionActual!: Date | null;

  // ----------------------------------------------------------
  // CAMPOS CALCULADOS POR EL BACKEND (geografía)
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

  // ----------------------------------------------------------
  // FASE 2 — RELACIÓN AL HISTORIAL DE ACCIONES (1:N)
  // ----------------------------------------------------------

  /**
   * Historial de intervenciones registradas para esta falla.
   * NO se carga por defecto (eager: false). Se carga solo en el
   * endpoint de detalle, no en listados ni gráficos.
   *
   * cascade: solo insert y update. Borrar acciones requiere pasar
   * por el service para que recalcule estadoActual correctamente.
   */
  @OneToMany(() => FallaRielAccion, (acc) => acc.falla, {
    cascade: ['insert', 'update'],
  })
  acciones!: FallaRielAccion[];
}