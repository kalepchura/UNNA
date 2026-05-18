import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../enums';

/**
 * Clave usada para guardar/leer los roles requeridos en la metadata
 * de una ruta. El RolesGuard la usa para saber qué roles permiten
 * acceder al endpoint.
 *
 * No la importas tú directamente, la usa el RolesGuard internamente.
 */
export const ROLES_KEY = 'roles';

/**
 * ============================================================
 * @Roles(...roles)
 * ============================================================
 * Decorator que marca un endpoint como "solo accesible por
 * estos roles".
 *
 * Uso:
 *   @Roles(RolUsuario.ADMINISTRADOR)
 *   @Get('auditoria')
 *   findAll() { ... }
 *
 *   @Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
 *   @Get('fallas')
 *   findAll() { ... }
 *
 * Si NO usas @Roles, el RolesGuard deja pasar a cualquier
 * usuario autenticado (siempre que pase el JwtAuthGuard).
 * ============================================================
 */
export const Roles = (...roles: RolUsuario[]) =>
  SetMetadata(ROLES_KEY, roles);