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
import { useEscenariosOptions } from '@/hooks/use-escenarios-options';
import type { MapaDesgasteGeneralFiltros } from './types/mapa-calor.types';

interface Props {
  filtros: MapaDesgasteGeneralFiltros;
  onChange: (f: MapaDesgasteGeneralFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

const SIN_FILTRO = '__all__';

export function FiltrosDesgasteGeneral({ filtros, onChange, onAplicar, isLoading }: Props) {
  const { options: escenariosOptions } = useEscenariosOptions();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Escenario */}
          <div>
            <Label className="text-sm font-medium">Escenario</Label>
            <Select
              value={filtros.escenarioId !== undefined ? String(filtros.escenarioId) : SIN_FILTRO}
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  escenarioId: value === SIN_FILTRO ? undefined : Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="REAL (por defecto)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_FILTRO}>Por defecto (REAL)</SelectItem>
                {escenariosOptions.map((op) => (
                  <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Punto W */}
          <div>
            <Label className="text-sm font-medium">Punto W</Label>
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
          </div>

          {/* Fecha de corte */}
          <div>
            <Label className="text-sm font-medium">Fecha de corte</Label>
            <input
              type="date"
              value={filtros.fechaCorte ?? ''}
              onChange={(e) =>
                onChange({ ...filtros, fechaCorte: e.target.value || undefined })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onAplicar} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Actualizar mapa'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}