import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para autenticación.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      // Guarda la sesión en localStorage
      persistSession: true,

      // Refresca automáticamente el token
      autoRefreshToken: true,

      // Detecta tokens del URL (#access_token)
      detectSessionInUrl: true,

      // Nombre del storage local
      storageKey: 'supabase-auth-token',
    },
  },
);

console.log(
  '🔧 Supabase cliente inicializado',
);