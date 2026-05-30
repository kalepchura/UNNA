import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import type { ComboboxOption } from '@/components/forms/combobox';

export function useCurvasHorizontalesOptions(viaFiltro?: string): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasHorizontalesSelector,
    queryFn: () => catalogosApi.curvasHorizontales.listarParaSelector(),
  });

  const options: ComboboxOption[] =
    (data ?? [])
      .filter((item) => !viaFiltro || viaFiltro === 'AMBAS' || item.via === viaFiltro)
      .map((item) => ({
        value: String(item.id),
        label: `${item.nombre} (${item.via})`,
      }));

  return { options, isLoading };
}