import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';

export function useCurvaVerticalDetalle(id: number | null, enabled = true) {
  return useApiQuery({
    queryKey: [...queryKeys.catalogos.curvasVerticales, 'detail', id],
    queryFn: () => catalogosApi.curvasVerticales.obtenerPorId(id!),
    enabled: enabled && id !== null && id > 0,
  });
}