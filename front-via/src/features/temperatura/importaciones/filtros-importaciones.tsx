import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
  DateInput,
} from '@/components/shared/filters-toolbar';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { FiltrosImportaciones as FiltrosType } from '../types/importacion-types';

interface Props {
  filtros: FiltrosType;
  onChange: (f: FiltrosType) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const TIPO_ARCHIVO_TODOS = 'todos';

export function FiltrosImportaciones({
  filtros,
  onChange,
  onBuscar,
  isLoading,
}: Props) {
  const { options: tramosOptions } = useTramosOptions();
  const activeCount = countActive(filtros);

  const handleClear = () => {
    onChange({ page: 1, limit: filtros.limit ?? 20 });
  };

  return (
    <FiltersToolbar
      description="Filtra las importaciones por tramo, tipo de archivo o rango de subida."
      activeCount={activeCount}
      onClear={activeCount > 0 ? handleClear : undefined}
      primaryAction={
        <Button onClick={onBuscar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Buscar'}
        </Button>
      }
    >
      <FiltersGrid columns={4}>
        <FilterField label="Tramos">
          <MultiSelect
            options={tramosOptions}
            selected={(filtros.tramoIds ?? []).map(String)}
            onChange={(values) =>
              onChange({ ...filtros, tramoIds: values.map(Number) })
            }
            placeholder="Todos"
            showAllOption
            allOptionLabel="Todos los tramos"
          />
        </FilterField>

        <FilterField label="Tipo de archivo">
          <Select
            value={filtros.tipoArchivo ?? TIPO_ARCHIVO_TODOS}
            onValueChange={(value) =>
              onChange({
                ...filtros,
                tipoArchivo:
                  value === TIPO_ARCHIVO_TODOS
                    ? undefined
                    : (value as 'CSV' | 'EXCEL' | 'XML'),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TIPO_ARCHIVO_TODOS}>Todos</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="EXCEL">Excel</SelectItem>
              <SelectItem value="XML">XML</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Subido desde">
          <DateInput
            value={filtros.fechaSubidaDesde ?? ''}
            onChange={(e) =>
              onChange({
                ...filtros,
                fechaSubidaDesde: e.target.value || undefined,
              })
            }
          />
        </FilterField>

        <FilterField label="Subido hasta">
          <DateInput
            value={filtros.fechaSubidaHasta ?? ''}
            onChange={(e) =>
              onChange({
                ...filtros,
                fechaSubidaHasta: e.target.value || undefined,
              })
            }
          />
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}

function countActive(f: FiltrosType): number {
  let n = 0;
  if (f.tramoIds?.length) n++;
  if (f.tipoArchivo) n++;
  if (f.fechaSubidaDesde) n++;
  if (f.fechaSubidaHasta) n++;
  return n;
}
