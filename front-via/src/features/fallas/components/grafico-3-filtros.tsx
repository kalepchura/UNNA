/**
 * Filtros del Gráfico 3 — Fallas por velocidad.
 *
 * FASE 1: agregados multi-select de curvas horizontales y verticales.
 * FASE 2.D: sección colapsable con 5 selectores de enum.
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
  DateInput,
} from '@/components/shared/filters-toolbar';
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

  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const apilarPorTipo = config.apilarPorTipo ?? false;
  const tramoIds = config.tramoIds ?? [];
  const curvaHIds = config.curvaHorizontalIds ?? [];
  const curvaVIds = config.curvaVerticalIds ?? [];
  const tipoDefectos = config.tipoDefectos ?? [];
  const elementosAfectados = config.elementosAfectados ?? [];
  const zonasAfectadas = config.zonasAfectadas ?? [];
  const perfiles = config.perfiles ?? [];
  const estadosActuales = config.estadosActuales ?? [];

  const puedeApilar = tipoFalla === 'AMBAS' || tipoFalla === undefined;

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
        <FilterField label="Fecha desde">
          <DateInput
            value={fechaDesde}
            onChange={(e) =>
              onChange({ ...config, fechaDesde: e.target.value })
            }
          />
        </FilterField>

        <FilterField label="Fecha hasta">
          <DateInput
            value={fechaHasta}
            onChange={(e) =>
              onChange({ ...config, fechaHasta: e.target.value })
            }
          />
        </FilterField>

        <FilterField label="Tipo de Falla">
          <Select
            value={tipoFalla ?? ''}
            onValueChange={(value) => {
              const nuevoConfig: Grafico3Filtros = {
                ...config,
                tipoFalla: value as Grafico3Filtros['tipoFalla'],
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
          label="Visualización"
          helper={
            !puedeApilar
              ? 'Disponible solo cuando "Tipo de Falla" es "Ambas".'
              : undefined
          }
        >
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
        </FilterField>

        <FilterField
          label="Tramos"
          span={3}
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

        {/* FASE 1 — Curvas */}
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

      {/* FASE 2.D — Sección colapsable */}
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