/**
 * Filtros para el listado de fallas de riel.
 * Componente controlado: el padre maneja el estado.
 * Aplicación inmediata (no hay botón "Buscar"; cambia al modificar).
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

export function FiltrosRiel({
  filtros,
  onChange,
  onLimpiar,
}: FiltrosRielProps) {
  const { options: tramosOptions } = useTramosOptions();
  const { options: curvasHOptions } = useCurvasHorizontalesOptions();
  const { options: curvasVOptions } = useCurvasVerticalesOptions();

  const actualizar = <K extends keyof FiltrosFallaRiel>(
    campo: K,
    valor: FiltrosFallaRiel[K],
  ) => {
    onChange({ ...filtros, [campo]: valor, page: 1 });
  };

  const tramoIdsAsString = (filtros.tramoIds ?? []).map(String);
  const curvaHIdsAsString = (filtros.curvaHorizontalIds ?? []).map(String);
  const curvaVIdsAsString = (filtros.curvaVerticalIds ?? []).map(String);

  const activeCount = countActive(filtros);

  return (
    <FiltersToolbar
      description="Refina el listado por tramo, curva, vía, carril o rango de fechas."
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

        <FilterField label="Curvas horizontales">
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
        </FilterField>

        <FilterField label="Curvas verticales">
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

        <FilterField label="Carril">
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
        </FilterField>

        <div className="hidden lg:block" />

        <FilterField label="Fecha desde" htmlFor="fechaDesde-riel">
          <DateInput
            id="fechaDesde-riel"
            value={filtros.fechaDesde ?? ''}
            onChange={(e) =>
              actualizar('fechaDesde', e.target.value || undefined)
            }
          />
        </FilterField>

        <FilterField label="Fecha hasta" htmlFor="fechaHasta-riel">
          <DateInput
            id="fechaHasta-riel"
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

function countActive(f: FiltrosFallaRiel): number {
  let n = 0;
  if (f.tramoIds?.length) n++;
  if (f.curvaHorizontalIds?.length) n++;
  if (f.curvaVerticalIds?.length) n++;
  if (f.via) n++;
  if (f.carril) n++;
  if (f.fechaDesde) n++;
  if (f.fechaHasta) n++;
  return n;
}
