import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico3TempFiltros } from '../types/grafico-3.types';

interface Props {
  config: Grafico3TempFiltros;
  onChange: (config: Grafico3TempFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico3Temp({
  config,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  const { options: tramosOptions } = useTramosOptions();

  const tramoIds = config.tramoIds ?? [];
  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fecha Desde */}
          <div>
            <Label className="text-sm font-medium">Fecha Desde</Label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => onChange({ ...config, fechaDesde: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <Label className="text-sm font-medium">Fecha Hasta</Label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => onChange({ ...config, fechaHasta: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Tramos */}
          <div>
            <Label className="text-sm font-medium">Tramos</Label>
            <MultiSelect
              options={tramosOptions}
              selected={tramoIds.map(String)}
              onChange={(values) =>
                onChange({
                  ...config,
                  tramoIds: values.map(Number),
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