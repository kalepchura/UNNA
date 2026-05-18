// frontend/src/hooks/use-cambiavias-options.ts

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import type { ComboboxOption } from '@/components/forms/combobox';

export function useCambiaviasOptions(): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.cambiaviasSelector,
    queryFn: () => catalogosApi.cambiavias.listarParaSelector(),
  });

  const options: ComboboxOption[] =
    data?.map((item) => ({
      value: String(item.id),
      label: item.codigoBd,
    })) ?? [];

  return { options, isLoading };
}