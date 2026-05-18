/**
 * Filtros del Gráfico 3 — Fallas por velocidad.
 *
 * Selectores cerrados (cero texto libre).
 * Las fechas usan <input type="date"> que el navegador valida.
 *
 * Si `apilarPorTipo` está activo Y `tipoFalla` es 'AMBAS', el gráfico
 * muestra series separadas para Riel y Soldadura.
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
import { MultiSelect } from '@/components/ui/multi-select';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico3Filtros } from '../types/grafico-3.types';

interface FiltrosProps {
  config: Grafico3Filtros;
  onChange: (config: Grafico3Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico3({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const { options: tramosOptions } = useTramosOptions();

  // Valores actuales (sin defaults forzados; mostramos lo que venga del padre)
  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const apilarPorTipo = config.apilarPorTipo ?? false;
  const tramoIds = config.tramoIds ?? [];

  // El selector "Apilar" solo aplica si el usuario eligió AMBAS
  // (si eligió solo RIEL o solo SOLDADURA, no hay nada que apilar)
  const puedeApilar = tipoFalla === 'AMBAS' || tipoFalla === undefined;

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
            <Select
              value={tipoFalla ?? ''}
              onValueChange={(value) => {
                // Si cambia a algo distinto de AMBAS, apagar el apilado
                const nuevoConfig: Grafico3Filtros = {
                  ...config,
                  tipoFalla: value,
                };
                if (value !== 'AMBAS' && apilarPorTipo) {
                  nuevoConfig.apilarPorTipo = false;
                }
                onChange(nuevoConfig);
              }}
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
              onValueChange={(value) =>
                onChange({ ...config, tipoVia: value })
              }
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

          {/* Apilar por tipo (solo si tipoFalla === AMBAS) */}
          <div>
            <Label className="text-sm font-medium">Visualización</Label>
            <Select
              value={apilarPorTipo ? 'SI' : 'NO'}
              disabled={!puedeApilar}
              onValueChange={(value) =>
                onChange({ ...config, apilarPorTipo: value === 'SI' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">Total combinado</SelectItem>
                <SelectItem value="SI">Apilar Riel + Soldadura</SelectItem>
              </SelectContent>
            </Select>
            {!puedeApilar && (
              <p className="text-xs text-muted-foreground mt-1">
                Disponible solo cuando "Tipo de Falla" es "Ambas"
              </p>
            )}
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