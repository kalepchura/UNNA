import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
} from '@/components/shared/filters-toolbar';
import { useEscenariosOptions } from '@/hooks/use-escenarios-options';
import type { Grafico2DesgasteFiltros } from '../types/grafico-2.types';

interface Props {
  config: Grafico2DesgasteFiltros;
  onChange: (config: Grafico2DesgasteFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico2Desgaste({
  config,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  const { options: escenariosOptions } = useEscenariosOptions();
  const escenarioIds = config.escenarioIds ?? [];

  return (
    <FiltersToolbar
      title="Filtros del gráfico"
      variant="flush"
      primaryAction={
        <Button onClick={onAplicar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Aplicar filtros'}
        </Button>
      }
    >
      <FiltersGrid columns={1}>
        <FilterField
          label="Escenarios"
          helper={
            escenarioIds.length === 0
              ? 'Mostrando todos los escenarios activos'
              : undefined
          }
        >
          <MultiSelect
            options={escenariosOptions}
            selected={escenarioIds.map(String)}
            onChange={(values) =>
              onChange({
                ...config,
                escenarioIds: values.map(Number),
              })
            }
            placeholder="Seleccionar escenarios…"
            showAllOption
            allOptionLabel="Todos los escenarios activos"
          />
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}
