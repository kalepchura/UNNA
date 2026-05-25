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
import { useEscenariosOptions } from '@/hooks/use-escenarios-options';
import type { MapaDesgasteGeneralFiltros } from './types/mapa-calor.types';

interface Props {
  filtros: MapaDesgasteGeneralFiltros;
  onChange: (f: MapaDesgasteGeneralFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

const SIN_FILTRO = '__all__';

export function FiltrosDesgasteGeneral({
  filtros,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  const { options: escenariosOptions } = useEscenariosOptions();

  return (
    <FiltersToolbar
      title="Filtros de la capa"
      description="Selecciona escenario, punto de medición y fecha de corte."
      primaryAction={
        <Button onClick={onAplicar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Actualizar mapa'}
        </Button>
      }
    >
      <FiltersGrid columns={3}>
        <FilterField label="Escenario">
          <Select
            value={
              filtros.escenarioId !== undefined
                ? String(filtros.escenarioId)
                : SIN_FILTRO
            }
            onValueChange={(value) =>
              onChange({
                ...filtros,
                escenarioId:
                  value === SIN_FILTRO ? undefined : Number(value),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="REAL (por defecto)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Por defecto (REAL)</SelectItem>
              {escenariosOptions.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Punto W">
          <Select
            value={filtros.puntoW ?? SIN_FILTRO}
            onValueChange={(value) =>
              onChange({
                ...filtros,
                puntoW: value === SIN_FILTRO ? undefined : (value as any),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="W1 (por defecto)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Por defecto (W1)</SelectItem>
              <SelectItem value="W1">W1</SelectItem>
              <SelectItem value="W2">W2</SelectItem>
              <SelectItem value="W3R">W3R</SelectItem>
              <SelectItem value="W3L">W3L</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Fecha de corte">
          <DateInput
            value={filtros.fechaCorte ?? ''}
            onChange={(e) =>
              onChange({
                ...filtros,
                fechaCorte: e.target.value || undefined,
              })
            }
          />
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}
