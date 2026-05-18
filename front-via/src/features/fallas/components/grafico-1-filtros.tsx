/**
 * Filtros del Gráfico 1 (Evolución temporal por tramo).
 *
 * Cero texto libre: todos los selectores son dropdowns/comboboxes.
 *
 * Comportamiento del año:
 *  - Granularidad MENSUAL → muestra solo "Año" (un solo año)
 *  - Granularidad ANUAL   → muestra "Año Inicio" + "Año Fin"
 *  - Año Fin solo permite valores ≥ Año Inicio (validación cruzada)
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
import { Card, CardContent } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { SelectorAnio } from './filtros-comunes/selector-anio';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico1Filtros } from '../types/grafico-1.types';

interface FiltrosProps {
  config: Grafico1Filtros;
  onChange: (config: Grafico1Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico1({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const { options: tramosOptions } = useTramosOptions();

  // Valores actuales (sin defaults, mostramos lo que venga del padre)
  const granularidad = config.granularidad;
  const anio = config.anio;
  const anioInicio = config.anioInicio;
  const anioFin = config.anioFin;
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const tramoIds = config.tramoIds ?? [];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Granularidad */}
          <div>
            <Label className="text-sm font-medium">Granularidad</Label>
            <Select
              value={granularidad ?? ''}
              onValueChange={(value: 'MENSUAL' | 'ANUAL') =>
                onChange({ ...config, granularidad: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona granularidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MENSUAL">Mensual</SelectItem>
                <SelectItem value="ANUAL">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Año (solo si MENSUAL) */}
          {granularidad === 'MENSUAL' && (
            <div>
              <Label className="text-sm font-medium">Año</Label>
              <SelectorAnio
                value={anio}
                onChange={(v) => onChange({ ...config, anio: v })}
              />
            </div>
          )}

          {/* Año Inicio + Año Fin (solo si ANUAL) */}
          {granularidad === 'ANUAL' && (
            <>
              <div>
                <Label className="text-sm font-medium">Año Inicio</Label>
                <SelectorAnio
                  value={anioInicio}
                  onChange={(v) => {
                    // Si el nuevo "inicio" es mayor que el "fin", ajustar el fin
                    const nuevoFin =
                      anioFin !== undefined && v > anioFin ? v : anioFin;
                    onChange({
                      ...config,
                      anioInicio: v,
                      anioFin: nuevoFin,
                    });
                  }}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Año Fin</Label>
                <SelectorAnio
                  value={anioFin}
                  onChange={(v) => onChange({ ...config, anioFin: v })}
                  // Bloquear años menores al anioInicio
                  minAnio={anioInicio}
                />
              </div>
            </>
          )}

          {/* Tipo de Falla */}
          <div>
            <Label className="text-sm font-medium">Tipo de Falla</Label>
            <Select
              value={tipoFalla ?? ''}
              onValueChange={(value) =>
                onChange({ ...config, tipoFalla: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AMBAS">Ambas</SelectItem>
                <SelectItem value="RIEL">Solo Riel</SelectItem>
                <SelectItem value="SOLDADURA">Solo Soldadura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Vía */}
          <div>
            <Label className="text-sm font-medium">Tipo de Vía</Label>
            <Select
              value={tipoVia ?? ''}
              onValueChange={(value) => onChange({ ...config, tipoVia: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona vía" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AMBAS">Ambas</SelectItem>
                <SelectItem value="PAR">Vía Par</SelectItem>
                <SelectItem value="IMPAR">Vía Impar</SelectItem>
              </SelectContent>
            </Select>
          </div>

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