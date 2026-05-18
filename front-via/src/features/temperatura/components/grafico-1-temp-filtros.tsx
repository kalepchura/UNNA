import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { SelectorAnio } from '@/features/fallas/components/filtros-comunes/selector-anio';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico1TempFiltros } from '../types/grafico-1.types';

interface FiltrosProps {
  config: Grafico1TempFiltros;
  onChange: (config: Grafico1TempFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico1Temp({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const { options: tramosOptions } = useTramosOptions();

  const granularidad = config.granularidad ?? 'MENSUAL';
  const anio = config.anio;
  const anioInicio = config.anioInicio;
  const anioFin = config.anioFin;
  const tramoIds = config.tramoIds ?? [];
  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Granularidad */}
          <div>
            <Label className="text-sm font-medium">Granularidad</Label>
            <Select
              value={granularidad}
              onValueChange={(value: 'DIARIA' | 'MENSUAL' | 'ANUAL') =>
                onChange({ ...config, granularidad: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona granularidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIARIA">Diaria</SelectItem>
                <SelectItem value="MENSUAL">Mensual</SelectItem>
                <SelectItem value="ANUAL">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Solo año (MENSUAL) */}
          {granularidad === 'MENSUAL' && (
            <div>
              <Label className="text-sm font-medium">Año</Label>
              <SelectorAnio
                value={anio}
                onChange={(v) => onChange({ ...config, anio: v })}
              />
            </div>
          )}

          {/* Año Inicio + Año Fin (ANUAL) */}
          {granularidad === 'ANUAL' && (
            <>
              <div>
                <Label className="text-sm font-medium">Año Inicio</Label>
                <SelectorAnio
                  value={anioInicio}
                  onChange={(v) => {
                    const nuevoFin = anioFin && v > anioFin ? v : anioFin;
                    onChange({ ...config, anioInicio: v, anioFin: nuevoFin });
                  }}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Año Fin</Label>
                <SelectorAnio
                  value={anioFin}
                  onChange={(v) => onChange({ ...config, anioFin: v })}
                  minAnio={anioInicio}
                />
              </div>
            </>
          )}

          {/* Rango de fechas (solo DIARIA) */}
          {granularidad === 'DIARIA' && (
            <>
              <div>
                <Label className="text-sm font-medium">Fecha Desde</Label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) =>
                    onChange({ ...config, fechaDesde: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha Hasta</Label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) =>
                    onChange({ ...config, fechaHasta: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          {/* Tramos */}
          <div className="lg:col-span-2">
            <Label className="text-sm font-medium">Tramos</Label>
            <MultiSelect
              options={tramosOptions}
              selected={tramoIds.map((id) => String(id))}
              onChange={(values) =>
                onChange({
                  ...config,
                  tramoIds: values.map((v) => Number(v)),
                })
              }
              placeholder="Seleccionar tramos..."
              showAllOption
              allOptionLabel="Todos los tramos"
            />
            {tramoIds.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Mostrando todos los tramos
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onAplicar} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Aplicar Filtros'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}