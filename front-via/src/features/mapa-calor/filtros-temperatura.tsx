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
import type { MapaTemperaturaFiltros } from './types/mapa-calor.types';

interface Props {
  filtros: MapaTemperaturaFiltros;
  onChange: (f: MapaTemperaturaFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosTemperatura({ filtros, onChange, onAplicar, isLoading }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Fecha Desde</Label>
            <input
              type="date"
              value={filtros.fechaDesde ?? ''}
              onChange={(e) => onChange({ ...filtros, fechaDesde: e.target.value || undefined })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Fecha Hasta</Label>
            <input
              type="date"
              value={filtros.fechaHasta ?? ''}
              onChange={(e) => onChange({ ...filtros, fechaHasta: e.target.value || undefined })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Tipo de valor</Label>
            <Select
              value={filtros.tipoValor ?? 'PROMEDIO'}
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  tipoValor: value as 'PROMEDIO' | 'MAXIMO',
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Promedio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROMEDIO">Promedio</SelectItem>
                <SelectItem value="MAXIMO">Máximo</SelectItem>
              </SelectContent>
            </Select>
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