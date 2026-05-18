// frontend/src/hooks/use-estaciones-options.ts

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import type { ComboboxOption } from '@/components/forms/combobox';

export function useEstacionesOptions(): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.estacionesSelector,
    queryFn: () => catalogosApi.estaciones.listarParaSelector(),
  });

  const options: ComboboxOption[] =
    data?.map((item) => ({
      value: String(item.id),
      label: `${item.codigo} - ${item.nombre}`, 
    })) ?? [];

  return { options, isLoading };
}