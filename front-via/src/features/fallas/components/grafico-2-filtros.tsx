/**
 * Filtros del Gráfico 2 (Distribución por categoría).
 *
 * FASE 1: agregados multi-select de curvas horizontales y verticales.
 * FASE 2.D:
 *  - 7 categorías nuevas en el dropdown (tipoDefecto, elementoAfectado,
 *    zonaAfectada, perfil, altaBaja, estadoActual, accionActualRiel)
 *  - Sección colapsable "Filtros avanzados" con 5 multi-select de enum
 */

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
import { SelectorTipoFalla } from './filtros-comunes/selector-tipo-falla';
import { SelectorTipoVia } from './filtros-comunes/selector-tipo-via';
import { SelectorTramos } from './filtros-comunes/selector-tramos';
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
import { CategoriaG2, LABEL_CATEGORIA_G2 } from '@/lib/types/enums/fallas.enum';
import type { Grafico2Filtros } from '../types/grafico-2.types';

interface FiltrosProps {
  config: Grafico2Filtros;
  onChange: (config: Grafico2Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico2({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';
  const tipoFalla = config.tipoFalla;
  const tipoVia = config.tipoVia;
  const categoria = config.categoria;
  const tramoIds = config.tramoIds ?? [];
  const curvaHIds = config.curvaHorizontalIds ?? [];
  const curvaVIds = config.curvaVerticalIds ?? [];
  const tipoDefectos = config.tipoDefectos ?? [];
  const elementosAfectados = config.elementosAfectados ?? [];
  const zonasAfectadas = config.zonasAfectadas ?? [];
  const perfiles = config.perfiles ?? [];
  const estadosActuales = config.estadosActuales ?? [];

  // Si la categoría agrupa por VIA, ocultar el filtro de tipoVia
  // (sería redundante: estarías agrupando POR vía mientras filtras una vía).
  const showTipoVia = categoria !== CategoriaG2.VIA;

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
          <SelectorTipoFalla
            value={tipoFalla}
            onChange={(v) =>
              onChange({ ...config, tipoFalla: v as Grafico2Filtros['tipoFalla'] })
            }
          />
        </FilterField>

        <FilterField label="Categoría">
          <Select
            value={categoria ?? ''}
            onValueChange={(value) =>
              onChange({ ...config, categoria: value as CategoriaG2 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              {/* Las 11 categorías con etiquetas legibles */}
              {Object.entries(LABEL_CATEGORIA_G2).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        {showTipoVia && (
          <FilterField label="Tipo de Vía">
            <SelectorTipoVia
              value={tipoVia}
              onChange={(v) => onChange({ ...config, tipoVia: v })}
            />
          </FilterField>
        )}

        <FilterField label="Tramos" span={showTipoVia ? 3 : 4}>
          <SelectorTramos
            value={tramoIds}
            onChange={(ids) => onChange({ ...config, tramoIds: ids })}
          />
        </FilterField>

        {/* FASE 1 — Curvas (solo aplican a fallas_riel) */}
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