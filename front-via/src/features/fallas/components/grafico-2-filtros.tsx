/**
 * Filtros del Gráfico 2 (Distribución por categoría).
 */

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
  DateInput,
} from '@/components/shared/filters-toolbar';
import { SelectorTipoFalla } from './filtros-comunes/selector-tipo-falla';
import { SelectorTipoVia } from './filtros-comunes/selector-tipo-via';
import { SelectorTramos } from './filtros-comunes/selector-tramos';
import type { Grafico2Filtros } from '../types/grafico-2.types';

interface FiltrosProps {
  config: Grafico2Filtros;
  onChange: (config: Grafico2Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico2({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const categoria = config.categoria;
  const tramoIds = config.tramoIds ?? [];

  const showTipoVia = categoria !== 'VIA';

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

        <FilterField label="Tipo de Falla">
          <SelectorTipoFalla
            value={tipoFalla}
            onChange={(v) => onChange({ ...config, tipoFalla: v })}
          />
        </FilterField>

        <FilterField label="Categoría">
          <Select
            value={categoria ?? ''}
            onValueChange={(value) =>
              onChange({ ...config, categoria: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACCION">Acción</SelectItem>
              <SelectItem value="CARRIL">Carril</SelectItem>
              <SelectItem value="UBICACION_FALLA">Ubicación de Falla</SelectItem>
              <SelectItem value="VIA">Vía</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        {showTipoVia && (
          <FilterField label="Tipo de Vía">
            <SelectorTipoVia
              value={tipoVia}
              onChange={(v) => onChange({ ...config, tipoVia: v })}
            />
          </FilterField>
        )}

        <FilterField label="Tramos" span={showTipoVia ? 3 : 4}>
          <SelectorTramos
            value={tramoIds}
            onChange={(ids) => onChange({ ...config, tramoIds: ids })}
          />
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}
