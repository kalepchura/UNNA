/**
 * Filtros del Gráfico 1 (Evolución temporal por tramo).
 *
 * FASE 1: agregados multi-select de curvas horizontales y verticales.
 * FASE 2.D: agregada sección colapsable "Filtros avanzados (riel)"
 * con 5 multi-select de enum (tipoDefecto, elementoAfectado,
 * zonaAfectada, perfil, estadoActual).
 *
 * Los filtros avanzados aplican SOLO a fallas_riel — las soldaduras
 * inox no tienen estos campos. Eso es transparente: si filtras por
 * un enum y tipoFalla=AMBAS, las soldaduras igual aparecen en el
 * conteo (no tienen el campo, no se filtran).
 */

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
} from '@/components/shared/filters-toolbar';
import { SelectorAnio } from './filtros-comunes/selector-anio';
import { SelectorCurvasHorizontales } from './filtros-comunes/selector-curvas-horizontales';
import { SelectorCurvasVerticales } from './filtros-comunes/selector-curvas-verticales';
import { FiltrosAvanzadosSeccion } from './filtros-comunes/filtros-avanzados-seccion';
import {
  SelectorTipoDefecto,
  SelectorElementoAfectado,
  SelectorZonaAfectada,
  SelectorPerfil,
  SelectorEstadoActual,
} from './filtros-comunes/selectores-enum-fallas';
import { useTramosOptions } from '@/hooks/use-tramos-options';
import type { Grafico1Filtros } from '../types/grafico-1.types';
import { GranularidadTemporal } from '@/lib/types/enums/fallas.enum';

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

  const granularidad = config.granularidad;
  const anio = config.anio;
  const anioInicio = config.anioInicio;
  const anioFin = config.anioFin;
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const tramoIds = config.tramoIds ?? [];
  const curvaHIds = config.curvaHorizontalIds ?? [];
  const curvaVIds = config.curvaVerticalIds ?? [];
  const tipoDefectos = config.tipoDefectos ?? [];
  const elementosAfectados = config.elementosAfectados ?? [];
  const zonasAfectadas = config.zonasAfectadas ?? [];
  const perfiles = config.perfiles ?? [];
  const estadosActuales = config.estadosActuales ?? [];

  // Contador para el badge de la sección colapsable.
  // Cuenta cuántos grupos de filtros avanzados tienen al menos 1 valor.
  const cantidadAvanzadosActivos = [
    tipoDefectos.length > 0,
    elementosAfectados.length > 0,
    zonasAfectadas.length > 0,
    perfiles.length > 0,
    estadosActuales.length > 0,
  ].filter(Boolean).length;

  return (
    <FiltersToolbar
      title="Filtros del gráfico"
      variant="flush"
      primaryAction={
        <Button onClick={onAplicar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Aplicar filtros'}
        </Button>
      }
    >
      <FiltersGrid columns={4}>
        <FilterField label="Granularidad">
          <Select
            value={granularidad ?? ''}
            onValueChange={(value: GranularidadTemporal) =>
              onChange({ ...config, granularidad: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona granularidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GranularidadTemporal.MENSUAL}>Mensual</SelectItem>
              <SelectItem value={GranularidadTemporal.ANUAL}>Anual</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        {granularidad === GranularidadTemporal.MENSUAL && (
          <FilterField label="Año">
            <SelectorAnio
              value={anio}
              onChange={(v) => onChange({ ...config, anio: v })}
            />
          </FilterField>
        )}

        {granularidad === GranularidadTemporal.ANUAL && (
          <>
            <FilterField label="Año Inicio">
              <SelectorAnio
                value={anioInicio}
                onChange={(v) => {
                  const nuevoFin =
                    anioFin !== undefined && v > anioFin ? v : anioFin;
                  onChange({
                    ...config,
                    anioInicio: v,
                    anioFin: nuevoFin,
                  });
                }}
              />
            </FilterField>
            <FilterField label="Año Fin">
              <SelectorAnio
                value={anioFin}
                onChange={(v) => onChange({ ...config, anioFin: v })}
                minAnio={anioInicio}
              />
            </FilterField>
          </>
        )}

        <FilterField label="Tipo de Falla">
          <Select
            value={tipoFalla ?? ''}
            onValueChange={(value) =>
              onChange({ ...config, tipoFalla: value as Grafico1Filtros['tipoFalla'] })
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
        </FilterField>

        <FilterField label="Tipo de Vía">
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
        </FilterField>

        <FilterField
          label="Tramos"
          span={2}
          helper={
            tramoIds.length === 0 ? 'Mostrando todos los tramos' : undefined
          }
        >
          <MultiSelect
            options={tramosOptions}
            selected={tramoIds.map((id) => String(id))}
            onChange={(values) =>
              onChange({
                ...config,
                tramoIds: values.map((v) => Number(v)),
              })
            }
            placeholder="Seleccionar tramos…"
            showAllOption
            allOptionLabel="Todos los tramos"
          />
        </FilterField>

        {/* FASE 1 — Filtros de curva (solo aplican a fallas_riel) */}
        <FilterField label="Curvas Horizontales" span={2}>
          <SelectorCurvasHorizontales
            value={curvaHIds}
            onChange={(ids) => onChange({ ...config, curvaHorizontalIds: ids })}
          />
        </FilterField>

        <FilterField label="Curvas Verticales" span={2}>
          <SelectorCurvasVerticales
            value={curvaVIds}
            onChange={(ids) => onChange({ ...config, curvaVerticalIds: ids })}
          />
        </FilterField>
      </FiltersGrid>

      {/* FASE 2.D — Sección colapsable de filtros avanzados (solo riel) */}
      <FiltrosAvanzadosSeccion cantidadActivos={cantidadAvanzadosActivos}>
        <FiltersGrid columns={3}>
          <FilterField label="Tipo de Defecto">
            <SelectorTipoDefecto
              value={tipoDefectos}
              onChange={(v) => onChange({ ...config, tipoDefectos: v })}
            />
          </FilterField>

          <FilterField label="Elemento Afectado">
            <SelectorElementoAfectado
              value={elementosAfectados}
              onChange={(v) => onChange({ ...config, elementosAfectados: v })}
            />
          </FilterField>

          <FilterField label="Zona Afectada">
            <SelectorZonaAfectada
              value={zonasAfectadas}
              onChange={(v) => onChange({ ...config, zonasAfectadas: v })}
            />
          </FilterField>

          <FilterField label="Perfil">
            <SelectorPerfil
              value={perfiles}
              onChange={(v) => onChange({ ...config, perfiles: v })}
            />
          </FilterField>

          <FilterField label="Estado Actual" span={2}>
            <SelectorEstadoActual
              value={estadosActuales}
              onChange={(v) => onChange({ ...config, estadosActuales: v })}
            />
          </FilterField>
        </FiltersGrid>
      </FiltrosAvanzadosSeccion>
    </FiltersToolbar>
  );
}