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
import { useEscenariosOptions } from '@/hooks/use-escenarios-options';
import { cn } from '@/lib/utils';
import type { MapaDesgasteIndiceFiltros } from './types/mapa-calor.types';

interface Props {
  filtros: MapaDesgasteIndiceFiltros;
  onChange: (f: MapaDesgasteIndiceFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

const SIN_FILTRO = '__all__';

export function FiltrosDesgasteIndice({
  filtros,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  const { options: escenariosOptions } = useEscenariosOptions();

  return (
    <FiltersToolbar
      title="Filtros de la capa"
      description="Configura los parámetros A y B para calcular el índice de desgaste."
      primaryAction={
        <Button onClick={onAplicar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Actualizar mapa'}
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ParametroBlock label="Parámetro A" accent="info">
          <FilterField label="Escenario A">
            <Select
              value={
                filtros.escenarioIdA !== undefined
                  ? String(filtros.escenarioIdA)
                  : SIN_FILTRO
              }
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  escenarioIdA:
                    value === SIN_FILTRO ? undefined : Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="REAL (por defecto)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_FILTRO}>
                  Por defecto (REAL)
                </SelectItem>
                {escenariosOptions.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Punto W A">
            <Select
              value={filtros.puntoWA ?? SIN_FILTRO}
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  puntoWA:
                    value === SIN_FILTRO ? undefined : (value as any),
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
          </FilterField>
        </ParametroBlock>

        <ParametroBlock label="Parámetro B" accent="warning">
          <FilterField label="Escenario B">
            <Select
              value={
                filtros.escenarioIdB !== undefined
                  ? String(filtros.escenarioIdB)
                  : SIN_FILTRO
              }
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  escenarioIdB:
                    value === SIN_FILTRO ? undefined : Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="REAL (por defecto)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_FILTRO}>
                  Por defecto (REAL)
                </SelectItem>
                {escenariosOptions.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Punto W B">
            <Select
              value={filtros.puntoWB ?? SIN_FILTRO}
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  puntoWB:
                    value === SIN_FILTRO ? undefined : (value as any),
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
          </FilterField>
        </ParametroBlock>
      </div>

      <div className="mt-4">
        <FiltersGrid columns={3}>
          <FilterField label="Fecha de corte">
            <DateInput
              value={filtros.fechaCorte ?? ''}
              onChange={(e) =>
                onChange({
                  ...filtros,
                  fechaCorte: e.target.value || undefined,
                })
              }
            />
          </FilterField>
        </FiltersGrid>
      </div>
    </FiltersToolbar>
  );
}

// ── ParametroBlock — small visual grouping for A vs B ────────────────────────

function ParametroBlock({
  label,
  accent,
  children,
}: {
  label: string;
  accent: 'info' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            accent === 'info' ? 'bg-info' : 'bg-warning',
          )}
        />
        <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-foreground">
          {label}
        </h4>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}
