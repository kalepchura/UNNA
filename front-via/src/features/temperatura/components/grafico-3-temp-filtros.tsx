import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
  DateInput,
} from '@/components/shared/filters-toolbar';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico3TempFiltros } from '../types/grafico-3.types';

interface Props {
  config: Grafico3TempFiltros;
  onChange: (config: Grafico3TempFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico3Temp({
  config,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  const { options: tramosOptions } = useTramosOptions();
  const tramoIds = config.tramoIds ?? [];
  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';

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
      <FiltersGrid columns={3}>
        <FilterField label="Fecha desde">
          <DateInput
            value={fechaDesde}
            onChange={(e) =>
              onChange({ ...config, fechaDesde: e.target.value })
            }
          />
        </FilterField>

        <FilterField label="Fecha hasta">
          <DateInput
            value={fechaHasta}
            onChange={(e) =>
              onChange({ ...config, fechaHasta: e.target.value })
            }
          />
        </FilterField>

        <FilterField
          label="Tramos"
          helper={
            tramoIds.length === 0 ? 'Mostrando todos los tramos' : undefined
          }
        >
          <MultiSelect
            options={tramosOptions}
            selected={tramoIds.map(String)}
            onChange={(values) =>
              onChange({
                ...config,
                tramoIds: values.map(Number),
              })
            }
            placeholder="Seleccionar tramos…"
            showAllOption
            allOptionLabel="Todos los tramos"
          />
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}
