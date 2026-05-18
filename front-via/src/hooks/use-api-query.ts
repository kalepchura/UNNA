import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { extraerMensajeError } from '@/lib/http';

/**
 * Wrapper de useQuery con manejo automático de errores via toast.
 *
 * Ventajas sobre useQuery directo:
 *  - No hay que escribir try/catch ni `if (error) toast.error(...)`
 *  - Toast solo se muestra UNA vez por error (TanStack reintenta en background)
 *  - Tipado consistente
 *
 * Uso típico:
 *   const { data, isLoading } = useApiQuery({
 *     queryKey: ['fallas', 'list', filtros],
 *     queryFn: () => fallasApi.riel.buscar(filtros),
 *   });
 */
export function useApiQuery<TData>(
  options: UseQueryOptions<TData, Error, TData, QueryKey> & {
    /** Si false, no muestra toast en error. Default: true. */
    mostrarToastError?: boolean;
  },
) {
  const { mostrarToastError = true, ...rest } = options;
  const query = useQuery<TData, Error>(rest);

  useEffect(() => {
    if (query.isError && mostrarToastError && query.error) {
      toast.error(extraerMensajeError(query.error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);

  return query;
}