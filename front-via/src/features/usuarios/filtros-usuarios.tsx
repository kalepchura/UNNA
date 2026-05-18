import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FiltrosUsuarios as FiltrosType } from './types/usuarios.types';

interface Props {
  filtros: FiltrosType;
  onChange: (f: FiltrosType) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const SIN_FILTRO = '__all__';

export function FiltrosUsuarios({ filtros, onChange, onBuscar, isLoading }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium">Correo</Label>
            <Input
              placeholder="Buscar por correo..."
              value={filtros.correo ?? ''}
              onChange={(e) =>
                onChange({ ...filtros, correo: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Nombre</Label>
            <Input
              placeholder="Buscar por nombre..."
              value={filtros.nombre ?? ''}
              onChange={(e) =>
                onChange({ ...filtros, nombre: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Rol</Label>
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
          </div>
          <div>
            <Label className="text-sm font-medium">Estado</Label>
            <Select
              value={
                filtros.activo === undefined
                  ? SIN_FILTRO
                  : filtros.activo
                  ? 'true'
                  : 'false'
              }
              onValueChange={(value) => {
                if (value === SIN_FILTRO) onChange({ ...filtros, activo: undefined });
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
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onBuscar} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Buscar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}