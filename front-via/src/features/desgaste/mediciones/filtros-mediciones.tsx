import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { SelectorAnio } from '@/features/fallas/components/filtros-comunes/selector-anio';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { CargarGrillaFiltros } from '../types/mediciones.types';

interface Props {
  filtros: CargarGrillaFiltros;
  onChange: (f: CargarGrillaFiltros) => void;
  onAplicar: () => void;
  busqueda: string;
  onBusquedaChange: (v: string) => void;
  isLoading?: boolean;
}

export function FiltrosMediciones({
  filtros,
  onChange,
  onAplicar,
  busqueda,
  onBusquedaChange,
  isLoading,
}: Props) {
  const { options: tramosOptions } = useTramosOptions();

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Años */}
          <div>
            <Label className="text-sm font-medium">Años (opcional)</Label>
            <div className="flex gap-2 mt-1">
              <SelectorAnio
                value={filtros.anios?.[0]}
                onChange={(v) =>
                  onChange({
                    ...filtros,
                    anios: filtros.anios ? [v, filtros.anios[1] ?? v] : [v],
                  })
                }
                placeholder="Desde"
              />
              <SelectorAnio
                value={filtros.anios?.[1]}
                onChange={(v) => {
                  const desde = filtros.anios?.[0] ?? v;
                  onChange({ ...filtros, anios: [desde, v] });
                }}
                placeholder="Hasta"
                minAnio={filtros.anios?.[0]}
              />
            </div>
          </div>

          {/* Tramos */}
          <div>
            <Label className="text-sm font-medium">Tramos</Label>
            <div className="mt-1">
              <MultiSelect
                options={tramosOptions}
                selected={(filtros.tramoIds ?? []).map(String)}
                onChange={(values) =>
                  onChange({ ...filtros, tramoIds: values.map(Number) })
                }
                placeholder="Todos los tramos"
                showAllOption
                allOptionLabel="Todos los tramos"
              />
            </div>
          </div>

          {/* ✅ Buscador por elemento, progresiva o vía */}
          <div>
            <Label className="text-sm font-medium">Buscar elemento</Label>
            <Input
              className="mt-1"
              placeholder="Código, progresiva o vía..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onAplicar} disabled={isLoading}>
            Aplicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}