// frontend/src/features/fallas/hooks/use-elementos-por-nivel.ts

/**
 * ============================================================
 * Hook unificado para el selector de elementos del gráfico.
 * ============================================================
 * Devuelve las opciones que corresponden al `nivel` elegido,
 * filtradas por la `via` cuando aplica.
 *
 * Reutiliza los hooks de catálogo existentes:
 *  - useTramosOptions
 *  - useCurvasHorizontalesOptions(viaFiltro)
 *  - useCurvasVerticalesOptions(viaFiltro)
 *  - useCambiaviasOptions
 *
 * NOTA sobre filtrado por vía:
 *  - Curvas H y V ya aceptan viaFiltro (lo aplican client-side).
 *  - Tramos y cambiavías NO se filtran por vía aquí porque:
 *      · Un tramo NO tiene "vía propia" (los tramos cruzan vías).
 *      · Cambiavía sí tiene `via`, pero hoy `useCambiaviasOptions`
 *        no recibe parámetro. El filtrado por vía del cambiavía
 *        se hace en el backend cuando se ejecuta la query del
 *        gráfico (vía `viaFiltro` que ya pasamos). Aquí en el
 *        SELECTOR mostramos todos.
 * ============================================================
 */

import { useTramosOptions } from '@/hooks/use-tramos-options';
import { useCurvasHorizontalesOptions } from '@/hooks/use-curvas-horizontales-options';
import { useCurvasVerticalesOptions } from '@/hooks/use-curvas-verticales-options';
import { useCambiaviasOptions } from '@/hooks/use-cambiavias-options';

import {
  NivelAnalisis,
  TipoViaFiltroFallas,
} from '@/lib/types/enums/fallas-graficos.enum';
import type { ComboboxOption } from '@/components/forms/combobox';

interface UseElementosPorNivelResult {
  options: ComboboxOption[];
  isLoading: boolean;
  /** Etiqueta amigable del nivel (para placeholder). */
  labelElementos: string;
}

/**
 * Convierte TipoViaFiltroFallas a string compatible con los hooks
 * de catálogo (que esperan 'PAR' | 'IMPAR' | 'AMBAS').
 *
 *  - TODAS, CERO, TERCERA → undefined (no filtra)
 *  - PAR / IMPAR → tal cual
 *
 * Los hooks de curvas solo conocen PAR/IMPAR. CERO y TERCERA no
 * tienen sentido ahí, así que pasamos undefined (no filtra).
 */
function adaptarViaParaCurvas(
  via: TipoViaFiltroFallas | undefined,
): string | undefined {
  if (!via) return undefined;
  if (via === TipoViaFiltroFallas.PAR) return 'PAR';
  if (via === TipoViaFiltroFallas.IMPAR) return 'IMPAR';
  return undefined;
}

export function useElementosPorNivel(
  nivel: NivelAnalisis | undefined,
  via: TipoViaFiltroFallas | undefined,
): UseElementosPorNivelResult {
  const viaCurvas = adaptarViaParaCurvas(via);

  // Llamamos a TODOS los hooks SIEMPRE (orden de hooks de React).
  // Solo devolvemos el resultado del nivel actual.
  const tramos = useTramosOptions();
  const curvasH = useCurvasHorizontalesOptions(viaCurvas);
  const curvasV = useCurvasVerticalesOptions(viaCurvas);
  const cambiavias = useCambiaviasOptions();

  if (!nivel) {
    return { options: [], isLoading: false, labelElementos: 'Elementos' };
  }

  switch (nivel) {
    case NivelAnalisis.TRAMO:
      return {
        options: tramos.options,
        isLoading: tramos.isLoading,
        labelElementos: 'Tramos',
      };
    case NivelAnalisis.CURVA_H:
      return {
        options: curvasH.options,
        isLoading: curvasH.isLoading,
        labelElementos: 'Curvas horizontales',
      };
    case NivelAnalisis.CURVA_V:
      return {
        options: curvasV.options,
        isLoading: curvasV.isLoading,
        labelElementos: 'Curvas verticales',
      };
    case NivelAnalisis.CAMBIAVIA:
      return {
        options: cambiavias.options,
        isLoading: cambiavias.isLoading,
        labelElementos: 'Cambiavías',
      };
  }
}