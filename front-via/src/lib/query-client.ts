import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente de TanStack Query.
 * Configuración global de fetching y cache.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // los datos son "frescos" 30s
      refetchOnWindowFocus: false, // evita refetch agresivo
      retry: 1,                    // reintentar 1 vez si falla
    },
    mutations: {
      retry: 0,                    // no reintentar mutations (POST/PATCH/DELETE)
    },
  },
});