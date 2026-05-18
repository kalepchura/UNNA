// frontend/src/hooks/use-tramos-options.ts

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import type { ComboboxOption } from '@/components/forms/combobox';

export function useTramosOptions(): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  // ✅ Usa listarParaSelector (no paraFiltro)
  const { data, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosSelector,
    queryFn: () => catalogosApi.tramos.listarParaSelector(),
  });

  const options: ComboboxOption[] =
    data?.map((item) => ({
      value: String(item.id),
      label: item.codigo,  // Solo el código
    })) ?? [];

  return { options, isLoading };
}