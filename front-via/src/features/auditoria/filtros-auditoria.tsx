import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FiltrarAuditoriaFiltros } from './types/auditoria.types';

const SIN_FILTRO = '__all__';

interface Props {
  filtros: FiltrarAuditoriaFiltros;
  onChange: (f: FiltrarAuditoriaFiltros) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

export function FiltrosAuditoria({ filtros, onChange, onBuscar, isLoading }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium">Módulo</Label>
            <Select
              value={filtros.modulo ?? SIN_FILTRO}
              onValueChange={(value) =>
                onChange({ ...filtros, modulo: value === SIN_FILTRO ? undefined : value })
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
          </div>

          <div>
            <Label className="text-sm font-medium">Operación</Label>
            <Select
              value={filtros.operacion ?? SIN_FILTRO}
              onValueChange={(value) =>
                onChange({ ...filtros, operacion: value === SIN_FILTRO ? undefined : value })
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
          </div>

          <div>
            <Label className="text-sm font-medium">Desde</Label>
            <input
              type="date"
              value={filtros.fechaDesde ?? ''}
              onChange={(e) =>
                onChange({ ...filtros, fechaDesde: e.target.value || undefined })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Hasta</Label>
            <input
              type="date"
              value={filtros.fechaHasta ?? ''}
              onChange={(e) =>
                onChange({ ...filtros, fechaHasta: e.target.value || undefined })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
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