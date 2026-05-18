import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RolUsuario } from '../../../common/enums';

/**
 * ============================================================
 * UsuarioApp
 * ============================================================
 * Tabla complementaria a auth.users de Supabase.
 *
 * Relación 1:1 con auth.users mediante el mismo UUID.
 * Aquí guardamos solo los datos NUESTROS (nombre, rol, activo).
 *
 * Referencia: Informe sección 6.3.1.
 * ============================================================
 */
@Entity({ name: 'usuarios_app' })
export class UsuarioApp {
  /**
   * UUID compartido con auth.users.id de Supabase.
   * NO se autogenera: lo recibimos de Supabase Auth al crear el usuario.
   */
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  /** Sincronizado con auth.users.email. */
  @Column({ name: 'correo', type: 'varchar', length: 150, unique: true })
  @Index()
  correo!: string;

  /**
   * Rol del usuario. CHECK constraint a nivel BD asegura que
   * solo los valores del enum sean aceptados.
   */
  @Column({
    name: 'rol',
    type: 'varchar',
    length: 20,
    enum: RolUsuario,
  })
  rol!: RolUsuario;

  /**
   * Si está en false, el usuario NO puede iniciar sesión
   * (el JwtAuthGuard rechaza el login).
   */
  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;
}