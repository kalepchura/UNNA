import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
} from '@/components/shared/filters-toolbar';
import type { FiltrosUsuarios as FiltrosType } from './types/usuarios.types';

interface Props {
  filtros: FiltrosType;
  onChange: (f: FiltrosType) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const SIN_FILTRO = '__all__';

export function FiltrosUsuarios({
  filtros,
  onChange,
  onBuscar,
  isLoading,
}: Props) {
  const activeCount = countActive(filtros);

  const handleClear = () => {
    onChange({ page: 1, limit: filtros.limit ?? 20 });
  };

  return (
    <FiltersToolbar
      description="Busca usuarios por correo, nombre, rol o estado."
      activeCount={activeCount}
      onClear={activeCount > 0 ? handleClear : undefined}
      primaryAction={
        <Button onClick={onBuscar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Buscar'}
        </Button>
      }
    >
      <FiltersGrid columns={4}>
        <FilterField label="Correo">
          <Input
            placeholder="Buscar por correo…"
            value={filtros.correo ?? ''}
            onChange={(e) =>
              onChange({ ...filtros, correo: e.target.value || undefined })
            }
          />
        </FilterField>

        <FilterField label="Nombre">
          <Input
            placeholder="Buscar por nombre…"
            value={filtros.nombre ?? ''}
            onChange={(e) =>
              onChange({ ...filtros, nombre: e.target.value || undefined })
            }
          />
        </FilterField>

        <FilterField label="Rol">
          <Select
            value={filtros.rol ?? SIN_FILTRO}
            onValueChange={(value) =>
              onChange({
                ...filtros,
                rol: value === SIN_FILTRO ? undefined : (value as any),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Todos</SelectItem>
              <SelectItem value="USUARIO">Usuario</SelectItem>
              <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Estado">
          <Select
            value={
              filtros.activo === undefined
                ? SIN_FILTRO
                : filtros.activo
                  ? 'true'
                  : 'false'
            }
            onValueChange={(value) => {
              if (value === SIN_FILTRO)
                onChange({ ...filtros, activo: undefined });
              else onChange({ ...filtros, activo: value === 'true' });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Todos</SelectItem>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}

function countActive(f: FiltrosType): number {
  let n = 0;
  if (f.correo) n++;
  if (f.nombre) n++;
  if (f.rol) n++;
  if (f.activo !== undefined) n++;
  return n;
}
