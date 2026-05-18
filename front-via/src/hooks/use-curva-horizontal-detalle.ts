import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';

export function useCurvaHorizontalDetalle(id: number | null, enabled = true) {
  return useApiQuery({
    queryKey: [...queryKeys.catalogos.curvasHorizontales, 'detail', id],
    queryFn: () => catalogosApi.curvasHorizontales.obtenerPorId(id!),
    enabled: enabled && id !== null && id > 0,
  });
}