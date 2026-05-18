import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Helper para invalidar queries por su prefijo de queryKey.
 *
 * Las queries de cache TODAS empiezan con un nombre de módulo
 * (ej: ['fallas', 'list', filtros]). Cuando una mutación afecta
 * el módulo, invalidamos por prefijo para que todas las queries
 * de ese módulo se refresquen.
 *
 * Uso:
 *   const invalidate = useInvalidate();
 *
 *   const eliminar = useApiMutation({
 *     mutationFn: ...,
 *     onSuccess: () => invalidate('fallas'),
 *   });
 *
 * Si pasás un array, invalida exactamente esa key.
 */
export function useInvalidate() {
  const queryClient = useQueryClient();

  return useCallback(
    (key: string | readonly unknown[]) => {
      const queryKey = Array.isArray(key) ? key : [key];

      queryClient.invalidateQueries({ queryKey });
    },
    [queryClient],
  );
}