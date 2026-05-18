/**
 * ============================================================
 * ENUMS DE USUARIOS Y AUTENTICACIÓN
 * ============================================================
 * Roles del sistema y permisos.
 *
 * Espejo exacto del backend en:
 *   src/common/enums/index.ts (sección "AUTENTICACIÓN / TRANSVERSAL")
 * ============================================================
 */

/**
 * Rol del usuario. Define qué páginas puede ver y qué acciones puede realizar.
 *
 * - USUARIO: acceso de lectura y escritura a fallas, temperatura, desgaste
 * - ADMINISTRADOR: además puede ver auditoría, restaurar registros eliminados,
 *   y gestionar usuarios
 *
 * NOTA: Si en el futuro se agrega un rol intermedio (ej: SUPERVISOR),
 * se agrega aquí Y en el backend al mismo tiempo.
 */
export enum RolUsuario {
  USUARIO = 'USUARIO',
  ADMINISTRADOR = 'ADMINISTRADOR',
}