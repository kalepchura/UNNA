/**
 * ============================================================
 * TIPOS COMUNES DEL FRONTEND
 * ============================================================
 * Este archivo es la "puerta de entrada" a los tipos compartidos:
 *
 *  1. Tipos genéricos del sistema (PaginatedResponse,
 *     AuditoriaBaseFields, UsuarioAutenticado).
 *
 *  2. Re-exports de TODOS los enums de la carpeta `enums/`.
 *     Esto permite que cualquier archivo del frontend pueda
 *     importar enums desde aquí sin saber su archivo exacto:
 *
 *     ✅ import { TipoVia, AccionFalla } from '@/lib/types/common'
 *     ✅ import { TipoVia } from '@/lib/types/enums/geograficos.enum'
 *
 *     Ambas formas funcionan. La primera es más cómoda; la
 *     segunda es más explícita. Usa la que prefieras.
 *
 * Para agregar un enum nuevo:
 *   1. Crear o editar el archivo en `enums/<dominio>.enum.ts`
 *   2. Agregar el re-export aquí abajo
 * ============================================================
 */

// ============================================================
// RE-EXPORTS DE ENUMS POR DOMINIO
// ============================================================

export * from './enums/geograficos.enum';
export * from './enums/auditoria.enum';
export * from './enums/usuarios.enum';
export * from './enums/fallas.enum';
export * from './enums/cambiavias.enum';
export * from './enums/desgaste.enum';

// ============================================================
// TIPOS GENÉRICOS DEL SISTEMA
// ============================================================

/**
 * Respuesta paginada estándar del backend.
 * El backend devuelve este formato en todos los endpoints de listado.
 *
 * @example
 * const respuesta: PaginatedResponse<FallaRiel> = await api.buscar(filtros);
 * // respuesta.data    → array de fallas
 * // respuesta.total   → total de registros (no solo de esta página)
 * // respuesta.page    → página actual
 * // respuesta.limit   → tamaño de página
 * // respuesta.totalPages → total de páginas
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Usuario autenticado actual (extraído del JWT de Supabase).
 * Lo expone el AuthContext para usar en toda la app.
 */
export interface UsuarioAutenticado {
  id: string;
  email: string;
  nombre: string;
  rol: import('./enums/usuarios.enum').RolUsuario;
  activo: boolean;
}

/**
 * Campos de auditoría que el backend agrega a casi todas las entidades.
 *
 * Las entidades transaccionales del sistema (FallaRiel,
 * FallaSoldaduraInox, etc.) extienden esta interfaz con sus
 * propios campos.
 *
 * @example
 * interface FallaRiel extends AuditoriaBaseFields {
 *   id: number;
 *   progresiva: number;
 *   // ... otros campos propios
 * }
 */
export interface AuditoriaBaseFields {
  /** UUID del usuario que creó el registro. */
  creadoPor: string;
  /** Timestamp ISO de creación. */
  creadoEn: string;
  /** UUID del último usuario que modificó, o null si no se ha modificado. */
  actualizadoPor: string | null;
  /** Timestamp ISO de la última modificación. */
  actualizadoEn: string;
  /** True si el registro fue soft-deleted. */
  eliminado: boolean;
  /** UUID del usuario que ejecutó el soft delete, o null. */
  eliminadoPorId: string | null;
}