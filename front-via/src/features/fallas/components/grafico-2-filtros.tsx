/**
 * Filtros del Gráfico 2 (Distribución por categoría).
 * Cero texto libre: usa selectores reutilizables.
 */

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SelectorTipoFalla } from './filtros-comunes/selector-tipo-falla';
import { SelectorTipoVia } from './filtros-comunes/selector-tipo-via';
import { SelectorTramos } from './filtros-comunes/selector-tramos';
import type { Grafico2Filtros } from '../types/grafico-2.types';

interface FiltrosProps {
  config: Grafico2Filtros;
  onChange: (config: Grafico2Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico2({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const categoria = config.categoria;
  const tramoIds = config.tramoIds ?? [];

  // Cuando categoría es VIA, el tipo de vía pierde sentido (ya se agrupa por eso)
  const showTipoVia = categoria !== 'VIA';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fecha Desde */}
          <div>
            <Label className="text-sm font-medium">Fecha Desde</Label>
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) =>
                onChange({ ...config, fechaDesde: e.target.value })
              }
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <Label className="text-sm font-medium">Fecha Hasta</Label>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) =>
                onChange({ ...config, fechaHasta: e.target.value })
              }
            />
          </div>

          {/* Tipo de Falla */}
          <div>
            <Label className="text-sm font-medium">Tipo de Falla</Label>
            <SelectorTipoFalla
              value={tipoFalla}
              onChange={(v) => onChange({ ...config, tipoFalla: v })}
            />
          </div>

          {/* Categoría */}
          <div>
            <Label className="text-sm font-medium">Categoría</Label>
            <Select
              value={categoria ?? ''}
              onValueChange={(value) =>
                onChange({ ...config, categoria: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACCION">Acción</SelectItem>
                <SelectItem value="CARRIL">Carril</SelectItem>
                <SelectItem value="UBICACION_FALLA">Ubicación de Falla</SelectItem>
                <SelectItem value="VIA">Vía</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Vía (solo si categoría no es VIA) */}
          {showTipoVia && (
            <div>
              <Label className="text-sm font-medium">Tipo de Vía</Label>
              <SelectorTipoVia
                value={tipoVia}
                onChange={(v) => onChange({ ...config, tipoVia: v })}
              />
            </div>
          )}

          {/* Tramos */}
          <div className="lg:col-span-2">
            <Label className="text-sm font-medium">Tramos</Label>
            <SelectorTramos
              value={tramoIds}
              onChange={(ids) => onChange({ ...config, tramoIds: ids })}
            />
          </div>
        </div>

        {/* Botón Aplicar */}
        <div className="mt-4 flex justify-end">
          <Button onClick={onAplicar} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Aplicar Filtros'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}