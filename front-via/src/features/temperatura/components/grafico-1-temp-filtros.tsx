import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
  DateInput,
} from '@/components/shared/filters-toolbar';
import { SelectorAnio } from '@/features/fallas/components/filtros-comunes/selector-anio';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico1TempFiltros } from '../types/grafico-1.types';

interface FiltrosProps {
  config: Grafico1TempFiltros;
  onChange: (config: Grafico1TempFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico1Temp({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const { options: tramosOptions } = useTramosOptions();

  const granularidad = config.granularidad ?? 'MENSUAL';
  const anio = config.anio;
  const anioInicio = config.anioInicio;
  const anioFin = config.anioFin;
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
      <FiltersGrid columns={4}>
        <FilterField label="Granularidad">
          <Select
            value={granularidad}
            onValueChange={(value: 'DIARIA' | 'MENSUAL' | 'ANUAL') =>
              onChange({ ...config, granularidad: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona granularidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIARIA">Diaria</SelectItem>
              <SelectItem value="MENSUAL">Mensual</SelectItem>
              <SelectItem value="ANUAL">Anual</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        {granularidad === 'MENSUAL' && (
          <FilterField label="Año">
            <SelectorAnio
              value={anio}
              onChange={(v) => onChange({ ...config, anio: v })}
            />
          </FilterField>
        )}

        {granularidad === 'ANUAL' && (
          <>
            <FilterField label="Año Inicio">
              <SelectorAnio
                value={anioInicio}
                onChange={(v) => {
                  const nuevoFin = anioFin && v > anioFin ? v : anioFin;
                  onChange({ ...config, anioInicio: v, anioFin: nuevoFin });
                }}
              />
            </FilterField>
            <FilterField label="Año Fin">
              <SelectorAnio
                value={anioFin}
                onChange={(v) => onChange({ ...config, anioFin: v })}
                minAnio={anioInicio}
              />
            </FilterField>
          </>
        )}

        {granularidad === 'DIARIA' && (
          <>
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
          </>
        )}

        <FilterField
          label="Tramos"
          span={2}
          helper={
            tramoIds.length === 0 ? 'Mostrando todos los tramos' : undefined
          }
        >
          <MultiSelect
            options={tramosOptions}
            selected={tramoIds.map((id) => String(id))}
            onChange={(values) =>
              onChange({
                ...config,
                tramoIds: values.map((v) => Number(v)),
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
