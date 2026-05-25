/**
 * Filtros para el listado de fallas de soldadura inox.
 */

import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
  DateInput,
} from '@/components/shared/filters-toolbar';
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

  const cambiaviaIdsAsString = (filtros.cambiaviaIds ?? []).map(String);
  const tramoIdsAsString = (filtros.tramoIds ?? []).map(String);
  const accionesAsString = (filtros.acciones ?? []) as string[];

  const accionesOptions = Object.values(AccionFalla).map((v) => ({
    value: v,
    label: v,
  }));

  const activeCount = countActive(filtros);

  return (
    <FiltersToolbar
      description="Refina el listado por cambiavía, acción, vía o rango de fechas."
      activeCount={activeCount}
      onClear={activeCount > 0 ? onLimpiar : undefined}
      collapsible
      secondaryAction={
        activeCount > 0 ? (
          <Button variant="outline" size="sm" onClick={onLimpiar}>
            Limpiar filtros
          </Button>
        ) : undefined
      }
    >
      <FiltersGrid columns={3}>
        <FilterField label="Cambiavías">
          <MultiSelect
            options={cambiaviasOptions}
            selected={cambiaviaIdsAsString}
            onChange={(vals) => actualizar('cambiaviaIds', vals.map(Number))}
            showAllOption
            allOptionLabel="Todos los cambiavías"
            itemLabelSingular="cambiavía"
            itemLabelPlural="cambiavías"
          />
        </FilterField>

        <FilterField label="Tramos">
          <MultiSelect
            options={tramosOptions}
            selected={tramoIdsAsString}
            onChange={(vals) => actualizar('tramoIds', vals.map(Number))}
            showAllOption
            allOptionLabel="Todos los tramos"
            itemLabelSingular="tramo"
          />
        </FilterField>

        <FilterField label="Acciones">
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
        </FilterField>

        <FilterField label="Vía">
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
        </FilterField>

        <FilterField label="Ubicación de falla">
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
        </FilterField>

        <div className="hidden lg:block" />

        <FilterField label="Fecha desde" htmlFor="fechaDesde-sold">
          <DateInput
            id="fechaDesde-sold"
            value={filtros.fechaDesde ?? ''}
            onChange={(e) =>
              actualizar('fechaDesde', e.target.value || undefined)
            }
          />
        </FilterField>

        <FilterField label="Fecha hasta" htmlFor="fechaHasta-sold">
          <DateInput
            id="fechaHasta-sold"
            value={filtros.fechaHasta ?? ''}
            onChange={(e) =>
              actualizar('fechaHasta', e.target.value || undefined)
            }
          />
        </FilterField>
      </FiltersGrid>
    </FiltersToolbar>
  );
}

function countActive(f: FiltrosFallaSoldadura): number {
  let n = 0;
  if (f.cambiaviaIds?.length) n++;
  if (f.tramoIds?.length) n++;
  if (f.acciones?.length) n++;
  if (f.via) n++;
  if (f.ubicacionFalla) n++;
  if (f.fechaDesde) n++;
  if (f.fechaHasta) n++;
  return n;
}
