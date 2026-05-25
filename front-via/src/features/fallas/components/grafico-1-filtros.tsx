/**
 * Filtros del Gráfico 1 (Evolución temporal por tramo).
 */

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
} from '@/components/shared/filters-toolbar';
import { SelectorAnio } from './filtros-comunes/selector-anio';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico1Filtros } from '../types/grafico-1.types';

interface FiltrosProps {
  config: Grafico1Filtros;
  onChange: (config: Grafico1Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico1({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const { options: tramosOptions } = useTramosOptions();

  const granularidad = config.granularidad;
  const anio = config.anio;
  const anioInicio = config.anioInicio;
  const anioFin = config.anioFin;
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const tramoIds = config.tramoIds ?? [];

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
            value={granularidad ?? ''}
            onValueChange={(value: 'MENSUAL' | 'ANUAL') =>
              onChange({ ...config, granularidad: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona granularidad" />
            </SelectTrigger>
            <SelectContent>
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
                  const nuevoFin =
                    anioFin !== undefined && v > anioFin ? v : anioFin;
                  onChange({
                    ...config,
                    anioInicio: v,
                    anioFin: nuevoFin,
                  });
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

        <FilterField label="Tipo de Falla">
          <Select
            value={tipoFalla ?? ''}
            onValueChange={(value) =>
              onChange({ ...config, tipoFalla: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AMBAS">Ambas</SelectItem>
              <SelectItem value="RIEL">Solo Riel</SelectItem>
              <SelectItem value="SOLDADURA">Solo Soldadura</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Tipo de Vía">
          <Select
            value={tipoVia ?? ''}
            onValueChange={(value) => onChange({ ...config, tipoVia: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona vía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AMBAS">Ambas</SelectItem>
              <SelectItem value="PAR">Vía Par</SelectItem>
              <SelectItem value="IMPAR">Vía Impar</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

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
