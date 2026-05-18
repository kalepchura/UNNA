/**
 * Token simbólico que NestJS usa para inyectar el cliente Supabase admin.
 * Lo definimos en una constante para evitar typos al usarlo con @Inject().
 */
export const SUPABASE_ADMIN_CLIENT = 'SUPABASE_ADMIN_CLIENT';