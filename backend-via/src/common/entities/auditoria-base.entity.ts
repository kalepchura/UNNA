import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ============================================================
 * AuditoriaBase
 * ============================================================
 * Clase ABSTRACTA. No genera tabla propia.
 * Todas las entidades transaccionales del sistema (FallaRiel,
 * FallaSoldaduraInox, TemperaturaImportacion, EscenarioMTB)
 * la extienden para heredar las columnas de auditoría.
 *
 * Define:
 *  - Quién creó / modificó / eliminó el registro
 *  - Cuándo se creó / modificó
 *  - Si está eliminado lógicamente (soft delete)
 *
 * Referencia: Informe sección 6.2.
 * ============================================================
 */
export abstract class AuditoriaBase {
  // ----------------------------------------------------------
  // QUIÉN
  // ----------------------------------------------------------

  /**
   * UUID del usuario que creó el registro.
   * Es FK lógica a usuarios_app.id.
   * Se llena automáticamente desde el JWT en el service.
   */
  @Column({
    name: 'creado_por',
    type: 'uuid',
    nullable: false,
  })
  creadoPor!: string;

  /**
   * UUID del último usuario que modificó el registro.
   * Es opcional (un registro recién creado no tiene "actualizado_por").
   */
  @Column({
    name: 'actualizado_por',
    type: 'uuid',
    nullable: true,
  })
  actualizadoPor!: string | null;

  /**
   * UUID del usuario que ejecutó el soft delete.
   * Null mientras el registro está activo.
   */
  @Column({
    name: 'eliminado_por_id',
    type: 'uuid',
    nullable: true,
  })
  eliminadoPorId!: string | null;

  // ----------------------------------------------------------
  // CUÁNDO
  // ----------------------------------------------------------

  /**
   * Timestamp de creación. Lo gestiona TypeORM automáticamente
   * con @CreateDateColumn (no hace falta setearlo manualmente).
   */
  @CreateDateColumn({
    name: 'creado_en',
    type: 'timestamptz',
  })
  creadoEn!: Date;

  /**
   * Timestamp de última modificación. Lo gestiona TypeORM
   * automáticamente con @UpdateDateColumn (se actualiza solo
   * en cada save()).
   */
  @UpdateDateColumn({
    name: 'actualizado_en',
    type: 'timestamptz',
  })
  actualizadoEn!: Date;

  // ----------------------------------------------------------
  // SOFT DELETE
  // ----------------------------------------------------------

  /**
   * Indicador de eliminación lógica (soft delete).
   * - false (default) → registro activo, visible
   * - true → registro eliminado lógicamente, oculto pero conservado
   *
   * Toda consulta de listado / KPI / gráfico debe filtrar por
   * `eliminado = false`.
   *
   * La restauración (volver a false) solo la puede hacer el
   * Administrador desde la página de Auditoría.
   */
  @Column({
    name: 'eliminado',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  eliminado!: boolean;
}