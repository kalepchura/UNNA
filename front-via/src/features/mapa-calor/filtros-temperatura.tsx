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
import type { MapaTemperaturaFiltros } from './types/mapa-calor.types';

interface Props {
  filtros: MapaTemperaturaFiltros;
  onChange: (f: MapaTemperaturaFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosTemperatura({
  filtros,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  return (
    <FiltersToolbar
      title="Filtros de la capa"
      description="Configura el rango y el tipo de valor a visualizar."
      primaryAction={
        <Button onClick={onAplicar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Actualizar mapa'}
        </Button>
      }
    >
      <FiltersGrid columns={3}>
        <FilterField label="Fecha desde">
          <DateInput
            value={filtros.fechaDesde ?? ''}
            onChange={(e) =>
              onChange({
                ...filtros,
                fechaDesde: e.target.value || undefined,
              })
            }
          />
        </FilterField>

        <FilterField label="Fecha hasta">
          <DateInput
            value={filtros.fechaHasta ?? ''}
            onChange={(e) =>
              onChange({
                ...filtros,
                fechaHasta: e.target.value || undefined,
              })
            }
          />
        </FilterField>

        <FilterField label="Tipo de valor">
          <Select
            value={filtros.tipoValor ?? 'PROMEDIO'}
            onValueChange={(value) =>
              onChange({
                ...filtros,
                tipoValor: value as 'PROMEDIO' | 'MAXIMO',
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Promedio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROMEDIO">Promedio</SelectItem>
              <SelectItem value="MAXIMO">Máximo</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}
