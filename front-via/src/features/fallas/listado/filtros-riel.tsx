/**
 * Filtros para el listado de fallas de riel.
 * Componente "controlado": el padre maneja el estado de los filtros
 * y este componente solo dispara cambios.
 */

import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import { useCurvasHorizontalesOptions } from '@/hooks/use-curvas-horizontales-options';
import { useCurvasVerticalesOptions } from '@/hooks/use-curvas-verticales-options';
import { TipoVia, LadoRiel } from '@/lib/types/common';
import type { FiltrosFallaRiel } from '@/features/fallas/types/falla-riel.types';

interface FiltrosRielProps {
  filtros: FiltrosFallaRiel;
  onChange: (filtros: FiltrosFallaRiel) => void;
  onLimpiar: () => void;
}

export function FiltrosRiel({ filtros, onChange, onLimpiar }: FiltrosRielProps) {
  const { options: tramosOptions } = useTramosOptions();
  const { options: curvasHOptions } = useCurvasHorizontalesOptions();
  const { options: curvasVOptions } = useCurvasVerticalesOptions();

  // Helper para actualizar un solo campo manteniendo el resto
  const actualizar = <K extends keyof FiltrosFallaRiel>(
    campo: K,
    valor: FiltrosFallaRiel[K],
  ) => {
    onChange({ ...filtros, [campo]: valor, page: 1 });
  };

  // Convertir IDs (number[]) ↔ strings para MultiSelect
  const tramoIdsAsString = (filtros.tramoIds ?? []).map(String);
  const curvaHIdsAsString = (filtros.curvaHorizontalIds ?? []).map(String);
  const curvaVIdsAsString = (filtros.curvaVerticalIds ?? []).map(String);

  return (
    <div className="filtros-section">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Tramos */}
        <div className="filtro-campo">
          <Label>Tramos</Label>
          <MultiSelect
            options={tramosOptions}
            selected={tramoIdsAsString}
            onChange={(vals) =>
              actualizar('tramoIds', vals.map(Number))
            }
            showAllOption
            allOptionLabel="Todos los tramos"
            itemLabelSingular="tramo"
          />
        </div>

        {/* Curvas horizontales */}
        <div className="filtro-campo">
          <Label>Curvas horizontales</Label>
          <MultiSelect
            options={curvasHOptions}
            selected={curvaHIdsAsString}
            onChange={(vals) =>
              actualizar('curvaHorizontalIds', vals.map(Number))
            }
            showAllOption
            allOptionLabel="Todas las curvas H"
            itemLabelSingular="curva"
            itemLabelPlural="curvas"
          />
        </div>

        {/* Curvas verticales */}
        <div className="filtro-campo">
          <Label>Curvas verticales</Label>
          <MultiSelect
            options={curvasVOptions}
            selected={curvaVIdsAsString}
            onChange={(vals) =>
              actualizar('curvaVerticalIds', vals.map(Number))
            }
            showAllOption
            allOptionLabel="Todas las curvas V"
            itemLabelSingular="curva"
            itemLabelPlural="curvas"
          />
        </div>

        {/* Vía */}
        <div className="filtro-campo">
          <Label>Vía</Label>
          <Select
            value={filtros.via ?? 'TODAS'}
            onValueChange={(v) =>
              actualizar('via', v === 'TODAS' ? undefined : (v as TipoVia))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas</SelectItem>
              <SelectItem value={TipoVia.PAR}>PAR</SelectItem>
              <SelectItem value={TipoVia.IMPAR}>IMPAR</SelectItem>
              <SelectItem value={TipoVia.TERCERA}>TERCERA</SelectItem>
              <SelectItem value={TipoVia.CERO}>CERO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Carril */}
        <div className="filtro-campo">
          <Label>Carril</Label>
          <Select
            value={filtros.carril ?? 'TODOS'}
            onValueChange={(v) =>
              actualizar('carril', v === 'TODOS' ? undefined : (v as LadoRiel))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value={LadoRiel.IZQUIERDA}>Izquierda</SelectItem>
              <SelectItem value={LadoRiel.DERECHA}>Derecha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Espacio vacío para alinear */}
        <div />

        {/* Fecha desde */}
        <div className="filtro-campo">
          <Label htmlFor="fechaDesde">Fecha desde</Label>
          <Input
            id="fechaDesde"
            type="date"
            value={filtros.fechaDesde ?? ''}
            onChange={(e) =>
              actualizar('fechaDesde', e.target.value || undefined)
            }
          />
        </div>

        {/* Fecha hasta */}
        <div className="filtro-campo">
          <Label htmlFor="fechaHasta">Fecha hasta</Label>
          <Input
            id="fechaHasta"
            type="date"
            value={filtros.fechaHasta ?? ''}
            onChange={(e) =>
              actualizar('fechaHasta', e.target.value || undefined)
            }
          />
        </div>

        {/* Botón limpiar */}
        <div className="filtro-campo flex items-end">
          <Button variant="outline" onClick={onLimpiar} className="w-full">
            Limpiar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}