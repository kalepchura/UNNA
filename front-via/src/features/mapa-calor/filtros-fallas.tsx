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
import type { MapaFallasFiltros, SegmentacionFallas } from './types/mapa-calor.types';

interface Props {
  filtros: MapaFallasFiltros;
  onChange: (f: MapaFallasFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosFallas({ filtros, onChange, onAplicar, isLoading }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fecha Desde */}
          <div>
            <Label className="text-sm font-medium">Fecha Desde</Label>
            <input
              type="date"
              value={filtros.fechaDesde ?? ''}
              onChange={(e) => onChange({ ...filtros, fechaDesde: e.target.value || undefined })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <Label className="text-sm font-medium">Fecha Hasta</Label>
            <input
              type="date"
              value={filtros.fechaHasta ?? ''}
              onChange={(e) => onChange({ ...filtros, fechaHasta: e.target.value || undefined })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Segmentación */}
          <div>
            <Label className="text-sm font-medium">Segmentación</Label>
            <Select
              value={filtros.segmentacion ?? 'TRAMO'}
              onValueChange={(value) =>
                onChange({ ...filtros, segmentacion: value as SegmentacionFallas })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tramo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRAMO">Tramo</SelectItem>
                <SelectItem value="CAMBIAVIA">Cambiavía</SelectItem>
                <SelectItem value="CURVA_HORIZONTAL">Curva Horizontal</SelectItem>
                <SelectItem value="CURVA_VERTICAL">Curva Vertical</SelectItem>
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