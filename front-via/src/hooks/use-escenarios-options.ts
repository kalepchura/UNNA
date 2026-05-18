import { useApiQuery } from '@/hooks/use-api-query';
import { desgasteApi } from '@/lib/api/desgaste.api';
import type { ComboboxOption } from '@/components/forms/combobox';

interface OpcionEscenario {
  id: number;
  etiqueta: string;
}

export function useEscenariosOptions(): {
  options: ComboboxOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useApiQuery({
    queryKey: ['desgaste', 'escenarios', 'selector'],
    queryFn: () => desgasteApi.wizard.obtenerOpciones({ paso: 6 }),
    staleTime: 5 * 60 * 1000,
  });

  const options: ComboboxOption[] =
    data?.opciones?.map((item: OpcionEscenario) => ({
      value: String(item.id),
      label: item.etiqueta,
    })) ?? [];

  return { options, isLoading };
}