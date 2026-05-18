import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

/**
 * ============================================================
 * Tramo
 * ============================================================
 * Representa un tramo de la Línea 1 (segmento entre dos
 * estaciones, ej: VES-PIN, PIN-CSC).
 *
 * Catálogo estático: se carga una vez al inicio del sistema.
 * NO tiene auditoría ni soft delete (no es transaccional).
 *
 * Referencia: Informe sección 6.4.1.
 * ============================================================
 */
@Entity({ name: 'tramos' })          // Nombre de la tabla en PostgreSQL
export class Tramo {
  /**
   * ID interno autoincremental.
   * Se genera automáticamente al insertar (no lo mandas tú).
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Código operativo único del tramo.
   * Ej: 'VES-PIN', 'T-01'.
   * Es el que se muestra en filtros y se usa para búsquedas
   * desde el frontend (en lugar del id numérico).
   */
  @Column({
    name: 'codigo',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
  })
  @Index() // Índice para búsquedas rápidas por código
  codigo!: string;

  /**
   * Nombre descriptivo del tramo.
   * Ej: 'Villa El Salvador - Pumacahua'.
   */
  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombre!: string;

  /**
   * Progresiva inicial del tramo, en metros desde el origen
   * de la línea (kilómetro 0).
   * Ej: 0, 1500, 3200.
   */
  @Column({
    name: 'progresiva_inicio',
    type: 'integer',
    nullable: false,
  })
  progresivaInicio!: number;

  /**
   * Progresiva final del tramo, en metros.
   * Debe ser mayor que progresivaInicio (validación a nivel service/DTO).
   */
  @Column({
    name: 'progresiva_fin',
    type: 'integer',
    nullable: false,
  })
  progresivaFin!: number;

  /**
   * Orden secuencial del tramo dentro de la línea.
   * Sirve para ordenar visualmente en el mapa de calor
   * y en listas. Debería ser único en la práctica.
   */
  @Column({
    name: 'orden',
    type: 'integer',
    nullable: false,
  })
  orden!: number;
}