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
import type {
  MapaFallasFiltros,
  SegmentacionFallas,
} from './types/mapa-calor.types';

interface Props {
  filtros: MapaFallasFiltros;
  onChange: (f: MapaFallasFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosFallas({
  filtros,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  return (
    <FiltersToolbar
      title="Filtros de la capa"
      description="Define el rango temporal y cómo agrupar las fallas en el mapa."
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

        <FilterField label="Segmentación">
          <Select
            value={filtros.segmentacion ?? 'TRAMO'}
            onValueChange={(value) =>
              onChange({
                ...filtros,
                segmentacion: value as SegmentacionFallas,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tramo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRAMO">Tramo</SelectItem>
              <SelectItem value="CAMBIAVIA">Cambiavía</SelectItem>
              <SelectItem value="CURVA_HORIZONTAL">Curva Horizontal</SelectItem>
              <SelectItem value="CURVA_VERTICAL">Curva Vertical</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}
