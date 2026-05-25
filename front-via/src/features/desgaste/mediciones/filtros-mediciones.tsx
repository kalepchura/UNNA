import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';

import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
} from '@/components/shared/filters-toolbar';

import { SelectorAnio } from '@/features/fallas/components/filtros-comunes/selector-anio';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import { useEscenariosOptions } from '@/hooks/use-escenarios-options';
import { Combobox } from '@/components/forms/combobox';

import type { CargarGrillaFiltros } from '../types/mediciones.types';

interface Props {
  filtros: CargarGrillaFiltros;
  onChange: (f: CargarGrillaFiltros) => void;
  onAplicar: () => void;
  busqueda: string;
  onBusquedaChange: (v: string) => void;
  isLoading?: boolean;
}

export function FiltrosMediciones({
  filtros,
  onChange,
  onAplicar,
  busqueda,
  onBusquedaChange,
  isLoading,
}: Props) {
  const { options: tramosOptions } = useTramosOptions();
  const { options: escenariosOptions, isLoading: loadingEscenarios } =
    useEscenariosOptions();

  const activeCount = countActive(filtros, busqueda);

  const handleClear = () => {
    onChange({});
    onBusquedaChange('');
  };

  return (
    <FiltersToolbar
      description="Selecciona escenario, tramo y rango de años, y busca un elemento específico."
      activeCount={activeCount}
      onClear={activeCount > 0 ? handleClear : undefined}
      primaryAction={
        <Button
          onClick={onAplicar}
          disabled={isLoading || !filtros.escenarioId}
          size="sm"
        >
          {isLoading ? 'Cargando…' : 'Aplicar'}
        </Button>
      }
    >
      <FiltersGrid columns={4}>
        {/* ESCENARIO */}
        <FilterField label="Escenario *">
          <Combobox
            options={escenariosOptions}
            value={filtros.escenarioId ? String(filtros.escenarioId) : ''}
            onChange={(v) =>
              onChange({ ...filtros, escenarioId: v ? Number(v) : undefined })
            }
            placeholder={
              loadingEscenarios ? 'Cargando…' : 'Selecciona escenario'
            }
            disabled={loadingEscenarios}
          />
        </FilterField>

        {/* AÑOS */}
        <FilterField label="Años (opcional)">
          <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
            <div className="w-[110px]">
              <SelectorAnio
                value={filtros.anios?.[0]}
                onChange={(v) =>
                  onChange({
                    ...filtros,
                    anios: filtros.anios ? [v, filtros.anios[1] ?? v] : [v],
                  })
                }
                placeholder="Desde"
              />
            </div>
            <div className="w-[110px]">
              <SelectorAnio
                value={filtros.anios?.[1]}
                onChange={(v) => {
                  const desde = filtros.anios?.[0] ?? v;
                  onChange({ ...filtros, anios: [desde, v] });
                }}
                placeholder="Hasta"
                minAnio={filtros.anios?.[0]}
              />
            </div>
          </div>
        </FilterField>

        {/* TRAMOS */}
        <FilterField label="Tramos">
          <MultiSelect
            options={tramosOptions}
            selected={(filtros.tramoIds ?? []).map(String)}
            onChange={(values) =>
              onChange({ ...filtros, tramoIds: values.map(Number) })
            }
            placeholder="Todos los tramos"
            showAllOption
            allOptionLabel="Todos los tramos"
          />
        </FilterField>

        {/* BÚSQUEDA */}
        <FilterField label="Buscar elemento">
          <Input
            placeholder="Código, progresiva o vía…"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
          />
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}

function countActive(f: CargarGrillaFiltros, busqueda: string): number {
  let n = 0;
  if (f.escenarioId) n++;
  if (f.anios?.length) n++;
  if (f.tramoIds?.length) n++;
  if (busqueda.trim()) n++;
  return n;
}