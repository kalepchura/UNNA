/**
 * Filtros para el listado de fallas de soldadura inox.
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
import { useCambiaviasOptions } from '@/hooks/use-cambiavias-options';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import { TipoVia, UbicacionFalla, AccionFalla } from '@/lib/types/common';
import type { FiltrosFallaSoldadura } from '@/features/fallas/types/falla-soldadura.types';

interface FiltrosSoldaduraProps {
  filtros: FiltrosFallaSoldadura;
  onChange: (filtros: FiltrosFallaSoldadura) => void;
  onLimpiar: () => void;
}

export function FiltrosSoldadura({
  filtros,
  onChange,
  onLimpiar,
}: FiltrosSoldaduraProps) {
  const { options: cambiaviasOptions } = useCambiaviasOptions();
  const { options: tramosOptions } = useTramosOptions();

  const actualizar = <K extends keyof FiltrosFallaSoldadura>(
    campo: K,
    valor: FiltrosFallaSoldadura[K],
  ) => {
    onChange({ ...filtros, [campo]: valor, page: 1 });
  };

  // Conversiones IDs (number[]) ↔ strings (para MultiSelect)
  const cambiaviaIdsAsString = (filtros.cambiaviaIds ?? []).map(String);
  const tramoIdsAsString = (filtros.tramoIds ?? []).map(String);
  const accionesAsString = (filtros.acciones ?? []) as string[];

  // Opciones del enum AccionFalla como options
  const accionesOptions = Object.values(AccionFalla).map((v) => ({
    value: v,
    label: v,
  }));

  return (
    <div className="filtros-section">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Cambiavías */}
        <div className="filtro-campo">
          <Label>Cambiavías</Label>
          <MultiSelect
            options={cambiaviasOptions}
            selected={cambiaviaIdsAsString}
            onChange={(vals) =>
              actualizar('cambiaviaIds', vals.map(Number))
            }
            showAllOption
            allOptionLabel="Todos los cambiavías"
            itemLabelSingular="cambiavía"
            itemLabelPlural="cambiavías"
          />
        </div>

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

        {/* Acciones (multi-select) */}
        <div className="filtro-campo">
          <Label>Acciones</Label>
          <MultiSelect
            options={accionesOptions}
            selected={accionesAsString}
            onChange={(vals) =>
              actualizar('acciones', vals as AccionFalla[])
            }
            showAllOption
            allOptionLabel="Todas las acciones"
            itemLabelSingular="acción"
            itemLabelPlural="acciones"
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

        {/* Ubicación de falla */}
        <div className="filtro-campo">
          <Label>Ubicación de falla</Label>
          <Select
            value={filtros.ubicacionFalla ?? 'TODAS'}
            onValueChange={(v) =>
              actualizar(
                'ubicacionFalla',
                v === 'TODAS' ? undefined : (v as UbicacionFalla),
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas</SelectItem>
              <SelectItem value={UbicacionFalla.ALMA}>Alma</SelectItem>
              <SelectItem value={UbicacionFalla.PATIN}>Patín</SelectItem>
              <SelectItem value={UbicacionFalla.HONGO}>Hongo</SelectItem>
              <SelectItem value={UbicacionFalla.RIEL}>Riel</SelectItem>
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