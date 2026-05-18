// frontend/src/hooks/use-curvas-verticales-options.ts

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import type { ComboboxOption } from '@/components/forms/combobox';

export function useCurvasVerticalesOptions(): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasVerticalesSelector,
    queryFn: () => catalogosApi.curvasVerticales.listarParaSelector(),
  });

  const options: ComboboxOption[] =
    data?.map((item) => ({
      value: String(item.id),
      label: `${item.nombre} (${item.via})`,
    })) ?? [];

  return { options, isLoading };
}