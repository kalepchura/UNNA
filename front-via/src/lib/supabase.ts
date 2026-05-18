import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para autenticación.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase-auth-token',
      flowType: 'pkce', 
    },
  },
);

console.log('🔧 Supabase cliente inicializado con storageKey:', 'supabase-auth-token');