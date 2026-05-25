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
import type { FiltrarAuditoriaFiltros } from './types/auditoria.types';

const SIN_FILTRO = '__all__';

interface Props {
  filtros: FiltrarAuditoriaFiltros;
  onChange: (f: FiltrarAuditoriaFiltros) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

export function FiltrosAuditoria({
  filtros,
  onChange,
  onBuscar,
  isLoading,
}: Props) {
  const activeCount = countActive(filtros);

  const handleClear = () => {
    onChange({ page: 1, limit: filtros.limit ?? 50 });
  };

  return (
    <FiltersToolbar
      description="Filtra el historial de operaciones por módulo, tipo y rango de fechas."
      activeCount={activeCount}
      onClear={activeCount > 0 ? handleClear : undefined}
      primaryAction={
        <Button onClick={onBuscar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Buscar'}
        </Button>
      }
    >
      <FiltersGrid columns={4}>
        <FilterField label="Módulo">
          <Select
            value={filtros.modulo ?? SIN_FILTRO}
            onValueChange={(v) =>
              onChange({
                ...filtros,
                modulo: v === SIN_FILTRO ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Todos</SelectItem>
              <SelectItem value="FALLAS">Fallas</SelectItem>
              <SelectItem value="TEMPERATURA">Temperatura</SelectItem>
              <SelectItem value="DESGASTE">Desgaste</SelectItem>
              <SelectItem value="AUDITORIA">Auditoría</SelectItem>
              <SelectItem value="USUARIOS">Usuarios</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Operación">
          <Select
            value={filtros.operacion ?? SIN_FILTRO}
            onValueChange={(v) =>
              onChange({
                ...filtros,
                operacion: v === SIN_FILTRO ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Todas</SelectItem>
              <SelectItem value="CREATE">Crear</SelectItem>
              <SelectItem value="UPDATE">Actualizar</SelectItem>
              <SelectItem value="DELETE">Eliminar</SelectItem>
              <SelectItem value="RESTORE">Restaurar</SelectItem>
              <SelectItem value="IMPORT">Importar</SelectItem>
              <SelectItem value="BULK_LOAD">Carga masiva</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Desde">
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

        <FilterField label="Hasta">
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
      </FiltersGrid>
    </FiltersToolbar>
  );
}

function countActive(f: FiltrarAuditoriaFiltros): number {
  let n = 0;
  if (f.modulo) n++;
  if (f.operacion) n++;
  if (f.fechaDesde) n++;
  if (f.fechaHasta) n++;
  return n;
}
