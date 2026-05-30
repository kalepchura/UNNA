/**
 * Filtros para el listado de fallas de riel.
 *
 * FASE 3 — Listado completo:
 *   - 6 filtros básicos visibles arriba (fechas, tramos, vía, estado, acción).
 *   - 8 filtros avanzados en sección colapsable
 *     (carril, curvas H/V, tipo defecto, elemento, zona, perfil, alta/baja).
 *
 * Componente controlado: el padre maneja el estado.
 * Aplicación inmediata (no hay botón "Buscar"; cambia al modificar).
 *
 * REGLA "VACÍO = TODAS":
 *   A diferencia de los gráficos (donde vacío = nada), aquí vacío
 *   significa "no acota el listado" (todas las fallas pasan).
 *   Esto es lo natural en un filtro de tabla.
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
import { FiltrosAvanzadosSeccion } from '@/features/fallas/components/filtros-comunes/filtros-avanzados-seccion';
import {
  SelectorEstadoActual,
  SelectorAccionRiel,
  SelectorTipoDefecto,
  SelectorElementoAfectado,
  SelectorZonaAfectada,
  SelectorPerfil,
  SelectorAltaBaja,
} from '@/features/fallas/components/filtros-comunes/selectores-enum-fallas';

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

  // ── Strings para MultiSelect (que trabaja con strings) ────
  const tramoIdsAsString  = (filtros.tramoIds ?? []).map(String);
  const curvaHIdsAsString = (filtros.curvaHorizontalIds ?? []).map(String);
  const curvaVIdsAsString = (filtros.curvaVerticalIds ?? []).map(String);

  // ── Contadores ────────────────────────────────────────────
  const activosBasicos = countActiveBasicos(filtros);
  const activosAvanzados = countActiveAvanzados(filtros);
  const activosTotal = activosBasicos + activosAvanzados;

  return (
    <FiltersToolbar
      description="Filtra el listado por fechas, geografía, estado, acción y caracterización del defecto."
      activeCount={activosTotal}
      onClear={activosTotal > 0 ? onLimpiar : undefined}
      collapsible
      secondaryAction={
        activosTotal > 0 ? (
          <Button variant="outline" size="sm" onClick={onLimpiar}>
            Limpiar filtros
          </Button>
        ) : undefined
      }
    >
      {/* ============================================================
          NIVEL 1 — FILTROS BÁSICOS (siempre visibles)
          ============================================================
          Lo que se usa el 80% del tiempo:
          fechas, tramos, vía, estado actual, acción actual.
      */}
      <FiltersGrid columns={3}>
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

        <FilterField label="Estado actual">
          <SelectorEstadoActual
            value={filtros.estadosActuales ?? []}
            onChange={(v) =>
              actualizar('estadosActuales', v.length > 0 ? v : undefined)
            }
          />
        </FilterField>

        <FilterField label="Acción actual">
          <SelectorAccionRiel
            value={filtros.accionesActuales ?? []}
            onChange={(v) =>
              actualizar('accionesActuales', v.length > 0 ? v : undefined)
            }
          />
        </FilterField>
      </FiltersGrid>

      {/* ============================================================
          NIVEL 2 — FILTROS AVANZADOS (sección colapsable)
          ============================================================
          Lo que usa el ingeniero al hacer análisis técnico:
          carril, curvas, caracterización del defecto.
      */}
      <FiltrosAvanzadosSeccion cantidadActivos={activosAvanzados}>
        <FiltersGrid columns={3}>
          <FilterField label="Carril">
            <Select
              value={filtros.carril ?? 'TODOS'}
              onValueChange={(v) =>
                actualizar(
                  'carril',
                  v === 'TODOS' ? undefined : (v as LadoRiel),
                )
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

          <FilterField label="Tipo de defecto">
            <SelectorTipoDefecto
              value={filtros.tipoDefectos ?? []}
              onChange={(v) =>
                actualizar('tipoDefectos', v.length > 0 ? v : undefined)
              }
            />
          </FilterField>

          <FilterField label="Elemento afectado">
            <SelectorElementoAfectado
              value={filtros.elementosAfectados ?? []}
              onChange={(v) =>
                actualizar(
                  'elementosAfectados',
                  v.length > 0 ? v : undefined,
                )
              }
            />
          </FilterField>

          <FilterField label="Zona afectada">
            <SelectorZonaAfectada
              value={filtros.zonasAfectadas ?? []}
              onChange={(v) =>
                actualizar('zonasAfectadas', v.length > 0 ? v : undefined)
              }
            />
          </FilterField>

          <FilterField label="Perfil">
            <SelectorPerfil
              value={filtros.perfiles ?? []}
              onChange={(v) =>
                actualizar('perfiles', v.length > 0 ? v : undefined)
              }
            />
          </FilterField>

          <FilterField label="Alta/Baja">
            <SelectorAltaBaja
              value={filtros.altasBajas ?? []}
              onChange={(v) =>
                actualizar('altasBajas', v.length > 0 ? v : undefined)
              }
            />
          </FilterField>
        </FiltersGrid>
      </FiltrosAvanzadosSeccion>
    </FiltersToolbar>
  );
}

// ============================================================
// CONTADORES DE FILTROS ACTIVOS
// ============================================================
// Se separan en básicos y avanzados para mostrar la cuenta de
// avanzados dentro del acordeón (igual que en G2).

function countActiveBasicos(f: FiltrosFallaRiel): number {
  let n = 0;
  if (f.fechaDesde) n++;
  if (f.fechaHasta) n++;
  if (f.tramoIds?.length) n++;
  if (f.via) n++;
  if (f.estadosActuales?.length) n++;
  if (f.accionesActuales?.length) n++;
  return n;
}

function countActiveAvanzados(f: FiltrosFallaRiel): number {
  let n = 0;
  if (f.carril) n++;
  if (f.curvaHorizontalIds?.length) n++;
  if (f.curvaVerticalIds?.length) n++;
  if (f.tipoDefectos?.length) n++;
  if (f.elementosAfectados?.length) n++;
  if (f.zonasAfectadas?.length) n++;
  if (f.perfiles?.length) n++;
  if (f.altasBajas?.length) n++;
  return n;
}