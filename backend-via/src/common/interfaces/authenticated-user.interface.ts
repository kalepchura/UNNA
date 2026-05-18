import { RolUsuario } from '../enums';

/**
 * ============================================================
 * AuthenticatedUser
 * ============================================================
 * Forma del objeto que el JwtAuthGuard inyecta en cada request
 * autenticado.
 *
 * En cualquier controller/service podemos hacer:
 *   @CurrentUser() user: AuthenticatedUser
 *
 * Y obtenemos:
 *   user.id      → UUID del usuario en usuarios_app
 *   user.correo  → email
 *   user.nombre  → nombre visible
 *   user.rol     → 'USUARIO' | 'ADMINISTRADOR'
 * ============================================================
 */
export interface AuthenticatedUser {
  /** UUID. Coincide con auth.users.id de Supabase y usuarios_app.id. */
  id: string;

  /** Email del usuario. */
  correo: string;

  /** Nombre visible (lo guardamos para auditoría sin tener que joinar). */
  nombre: string;

  /** Rol que define los permisos. */
  rol: RolUsuario;
}