// Importamos la función que crea el cliente oficial de Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

/**
 * Crea un cliente de Supabase con la SERVICE_ROLE_KEY.
 * 
 * ⚠️ Este cliente tiene PERMISOS TOTALES sobre tu proyecto Supabase.
 *    Solo se usa en el backend. NUNCA lo expongas al frontend.
 * 
 * Lo usaremos sobre todo para:
 *  - supabase.auth.admin.createUser()  → crear usuarios desde admin
 *  - supabase.auth.admin.deleteUser()  → eliminar usuarios
 *  - supabase.auth.admin.updateUserById()
 */
export const createSupabaseAdminClient = (
  configService: ConfigService,
): SupabaseClient => {
  // Leemos las variables del .env
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const serviceRoleKey = configService.get<string>(
    'SUPABASE_SERVICE_ROLE_KEY',
  );

  // Validación: si falta alguna, mejor que el backend ni arranque
  // (es más fácil descubrir el error ahora que en producción)
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env',
    );
  }

  // Creamos el cliente con configuración admin:
  // - autoRefreshToken: false → no refresca tokens (es un cliente de servidor)
  // - persistSession: false → no guarda sesión (cada request es independiente)
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};