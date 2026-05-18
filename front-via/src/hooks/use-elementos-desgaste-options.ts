// frontend/src/hooks/use-elementos-desgaste-options.ts

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import type { ComboboxOption } from '@/components/forms/combobox';

export function useElementosDesgasteOptions(): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.elementosDesgasteSelector,
    queryFn: () => catalogosApi.elementosDesgaste.listarParaSelector(),
  });

  const options: ComboboxOption[] =
    data?.map((item) => ({
      value: String(item.id),
      label: String(item.codigoElemento),
    })) ?? [];

  return { options, isLoading };
}