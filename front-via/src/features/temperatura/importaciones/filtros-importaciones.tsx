import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { FiltrosImportaciones as FiltrosType } from '../types/importacion-types';

interface Props {
  filtros: FiltrosType;
  onChange: (f: FiltrosType) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

const TIPO_ARCHIVO_TODOS = 'todos';

export function FiltrosImportaciones({ filtros, onChange, onBuscar, isLoading }: Props) {
  const { options: tramosOptions } = useTramosOptions();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Tramos */}
          <div>
            <Label className="text-sm font-medium">Tramos</Label>
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
          </div>

          {/* Tipo de archivo */}
          <div>
            <Label className="text-sm font-medium">Tipo de archivo</Label>
            <Select
              // ✅ Nunca string vacío — usamos centinela 'todos'
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
                {/* ✅ value nunca vacío */}
                <SelectItem value={TIPO_ARCHIVO_TODOS}>Todos</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
                <SelectItem value="EXCEL">Excel</SelectItem>
                <SelectItem value="XML">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha subida desde */}
          <div>
            <Label className="text-sm font-medium">Subido desde</Label>
            <input
              type="date"
              value={filtros.fechaSubidaDesde ?? ''}
              onChange={(e) =>
                onChange({
                  ...filtros,
                  fechaSubidaDesde: e.target.value || undefined,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Fecha subida hasta */}
          <div>
            <Label className="text-sm font-medium">Subido hasta</Label>
            <input
              type="date"
              value={filtros.fechaSubidaHasta ?? ''}
              onChange={(e) =>
                onChange({
                  ...filtros,
                  fechaSubidaHasta: e.target.value || undefined,
                })
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