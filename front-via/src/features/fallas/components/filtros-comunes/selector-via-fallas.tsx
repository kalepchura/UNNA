// frontend/src/features/fallas/components/filtros-comunes/selector-via-fallas.tsx

/**
 * Selector de vía contextual al NIVEL.
 *
 * Reglas (espejo del backend en VIAS_VALIDAS_POR_NIVEL):
 *  - Nivel TRAMO/CURVA_H/CURVA_V → 3 opciones: PAR, IMPAR, TODAS.
 *  - Nivel CAMBIAVIA             → 5 opciones: + CERO, TERCERA.
 *
 * Si el usuario tenía elegido CERO/TERCERA y cambia a un nivel
 * que no las admite, el componente padre debe resetear la vía
 * a TODAS (lo hace SelectorNivelCascada).
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  NivelAnalisis,
  TipoViaFiltroFallas,
  LABEL_VIA_FALLAS,
  VIAS_VALIDAS_POR_NIVEL,
} from '@/lib/types/enums/fallas-graficos.enum';

interface SelectorViaFallasProps {
  nivel: NivelAnalisis | undefined;
  value: TipoViaFiltroFallas | undefined;
  onChange: (v: TipoViaFiltroFallas) => void;
  disabled?: boolean;
}

export function SelectorViaFallas({
  nivel,
  value,
  onChange,
  disabled,
}: SelectorViaFallasProps) {
  // Si no hay nivel elegido, mostramos las 3 opciones más comunes.
  // El nivel CAMBIAVIA agregará CERO/TERCERA cuando se elija.
  const opciones = nivel
    ? VIAS_VALIDAS_POR_NIVEL[nivel]
    : [TipoViaFiltroFallas.PAR, TipoViaFiltroFallas.IMPAR, TipoViaFiltroFallas.TODAS];

  return (
    <Select
      value={value ?? ''}
      disabled={disabled}
      onValueChange={(v) => onChange(v as TipoViaFiltroFallas)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona vía" />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((v) => (
          <SelectItem key={v} value={v}>
            {LABEL_VIA_FALLAS[v]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}