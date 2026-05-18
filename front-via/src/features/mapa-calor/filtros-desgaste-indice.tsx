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
import type { MapaDesgasteIndiceFiltros } from './types/mapa-calor.types';

interface Props {
  filtros: MapaDesgasteIndiceFiltros;
  onChange: (f: MapaDesgasteIndiceFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

const SIN_FILTRO = '__all__';

export function FiltrosDesgasteIndice({ filtros, onChange, onAplicar, isLoading }: Props) {
  const { options: escenariosOptions } = useEscenariosOptions();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bloque A */}
          <div className="space-y-4 rounded-md border p-3">
            <h3 className="font-medium text-sm">Parámetro A</h3>
            <div>
              <Label className="text-sm">Escenario A</Label>
              <Select
                value={filtros.escenarioIdA !== undefined ? String(filtros.escenarioIdA) : SIN_FILTRO}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    escenarioIdA: value === SIN_FILTRO ? undefined : Number(value),
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
            <div>
              <Label className="text-sm">Punto W A</Label>
              <Select
                value={filtros.puntoWA ?? SIN_FILTRO}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    puntoWA: value === SIN_FILTRO ? undefined : (value as any),
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
          </div>

          {/* Bloque B */}
          <div className="space-y-4 rounded-md border p-3">
            <h3 className="font-medium text-sm">Parámetro B</h3>
            <div>
              <Label className="text-sm">Escenario B</Label>
              <Select
                value={filtros.escenarioIdB !== undefined ? String(filtros.escenarioIdB) : SIN_FILTRO}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    escenarioIdB: value === SIN_FILTRO ? undefined : Number(value),
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
            <div>
              <Label className="text-sm">Punto W B</Label>
              <Select
                value={filtros.puntoWB ?? SIN_FILTRO}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    puntoWB: value === SIN_FILTRO ? undefined : (value as any),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="W2 (por defecto)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_FILTRO}>Por defecto (W2)</SelectItem>
                  <SelectItem value="W1">W1</SelectItem>
                  <SelectItem value="W2">W2</SelectItem>
                  <SelectItem value="W3R">W3R</SelectItem>
                  <SelectItem value="W3L">W3L</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Fecha de corte común */}
        <div className="mt-4">
          <Label className="text-sm">Fecha de corte</Label>
          <input
            type="date"
            value={filtros.fechaCorte ?? ''}
            onChange={(e) =>
              onChange({ ...filtros, fechaCorte: e.target.value || undefined })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
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