import { useApiQuery } from '@/hooks/use-api-query';
import { desgasteApi } from '@/lib/api/desgaste.api';
import type { ComboboxOption } from '@/components/forms/combobox';

export function useEscenariosOptions(): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useApiQuery({
    queryKey: ['desgaste', 'escenarios', 'selector'],
    queryFn: () => desgasteApi.escenarios.buscar({ page: 1, limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const options: ComboboxOption[] =
    data?.data
      ?.filter((e) => !e.eliminado)
      .map((e) => ({
        value: String(e.id),
        label: e.nombre,
      })) ?? [];

  return { options, isLoading };
}