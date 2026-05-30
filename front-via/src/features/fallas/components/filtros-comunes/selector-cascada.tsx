// frontend/src/features/fallas/components/filtros-comunes/selector-cascada.tsx

/**
 * ============================================================
 * SelectorCascada — el núcleo de los filtros de los 3 gráficos.
 * ============================================================
 * Cambios respecto a la versión anterior:
 *   - Acepta `errores: Set<string>` para marcar campos en rojo.
 *   - SelectorElementos recibe `mostrarSeleccionarTodos` y
 *     `hasError` para el borde rojo y el botón "Seleccionar todos".
 * ============================================================
 */

import { FilterField, FiltersGrid } from '@/components/shared/filters-toolbar';
import { SelectorNivel } from './selector-nivel';
import { SelectorViaFallas } from './selector-via-fallas';
import { SelectorTipoFallaFallas } from './selector-tipo-falla-fallas';
import { SelectorElementos } from './selector-elementos';

import {
  NivelAnalisis,
  TipoViaFiltroFallas,
  VIAS_VALIDAS_POR_NIVEL,
  nivelPermiteTipoFalla,
} from '@/lib/types/enums/fallas-graficos.enum';
import { TipoFallaFiltro } from '@/lib/types/enums/fallas.enum';

/** Forma mínima común a las 3 configs (G1, G2, G3). */
export interface CascadaValue {
  nivel?: NivelAnalisis;
  tipoVia?: TipoViaFiltroFallas;
  tipoFalla?: TipoFallaFiltro;
  elementoIds?: number[];
}

interface SelectorCascadaProps<T extends CascadaValue> {
  config: T;
  onChange: (config: T) => void;
  /** Campos que deben mostrarse en rojo (tras intentar aplicar). */
  errores?: Set<string>;
}

export function SelectorCascada<T extends CascadaValue>({
  config,
  onChange,
  errores = new Set(),
}: SelectorCascadaProps<T>) {
  const nivel      = config.nivel;
  const tipoVia    = config.tipoVia;
  const tipoFalla  = config.tipoFalla;
  const elementoIds = config.elementoIds ?? [];

  const tieneError = (campo: string) => errores.has(campo);

  // ── Handler: cambia nivel ──────────────────────────────────
  const handleNivelChange = (nuevoNivel: NivelAnalisis) => {
    const viasValidas = VIAS_VALIDAS_POR_NIVEL[nuevoNivel];

    const nuevaVia: TipoViaFiltroFallas =
      tipoVia && viasValidas.includes(tipoVia)
        ? tipoVia
        : TipoViaFiltroFallas.TODAS;

    const nuevoTipoFalla = !nivelPermiteTipoFalla(nuevoNivel)
      ? TipoFallaFiltro.SOLDADURA
      : tipoFalla;

    onChange({
      ...config,
      nivel: nuevoNivel,
      tipoVia: nuevaVia,
      tipoFalla: nuevoTipoFalla,
      elementoIds: [],
    });
  };

  // ── Handler: cambia vía ────────────────────────────────────
  const handleViaChange = (nuevaVia: TipoViaFiltroFallas) => {
    onChange({ ...config, tipoVia: nuevaVia, elementoIds: [] });
  };

  // ── Handler: cambia tipo de falla ──────────────────────────
  const handleTipoFallaChange = (nuevoTipoFalla: TipoFallaFiltro) => {
    onChange({ ...config, tipoFalla: nuevoTipoFalla });
  };

  // ── Handler: cambia elementos ──────────────────────────────
  const handleElementosChange = (ids: number[]) => {
    onChange({ ...config, elementoIds: ids });
  };

  const mostrarTipoFalla = nivelPermiteTipoFalla(nivel);

  // Helper label para el campo elementos según si hay nivel o no
  const helperElementos = !nivel
    ? 'Selecciona primero un nivel.'
    : elementoIds.length === 0
    ? 'Debes seleccionar al menos un elemento.'
    : undefined;

  return (
    <FiltersGrid columns={4}>
      {/* ── Nivel ──────────────────────────────────────────── */}
      <FilterField
        label="Nivel de análisis"
        error={tieneError('nivel') ? 'Obligatorio' : undefined}
      >
        <SelectorNivel
          value={nivel}
          onChange={handleNivelChange}
          hasError={tieneError('nivel')}
        />
      </FilterField>

      {/* ── Vía ────────────────────────────────────────────── */}
      <FilterField label="Vía">
        <SelectorViaFallas
          nivel={nivel}
          value={tipoVia}
          onChange={handleViaChange}
        />
      </FilterField>

      {/* ── Tipo de Falla (condicional) ─────────────────────── */}
      {mostrarTipoFalla && (
        <FilterField label="Tipo de Falla">
          <SelectorTipoFallaFallas
            value={tipoFalla}
            onChange={handleTipoFallaChange}
          />
        </FilterField>
      )}

      {/* ── Elementos del nivel ────────────────────────────── */}
      <FilterField
        label="Elementos del nivel"
        span={mostrarTipoFalla ? 4 : 3}
        helper={helperElementos}
        error={tieneError('elementoIds') ? 'Debes seleccionar al menos un elemento.' : undefined}
      >
        <SelectorElementos
          nivel={nivel}
          via={tipoVia}
          value={elementoIds}
          onChange={handleElementosChange}
          hasError={tieneError('elementoIds')}
          mostrarSeleccionarTodos
        />
      </FilterField>
    </FiltersGrid>
  );
}