// frontend/src/features/fallas/components/filtros-comunes/selector-tipo-falla-fallas.tsx

/**
 * Selector de tipo de falla contextual al nivel.
 *
 * Reglas:
 *  - Nivel TRAMO/CURVA_H/CURVA_V → muestra 3 opciones: AMBAS / RIEL / SOLDADURA.
 *  - Nivel CAMBIAVIA             → NO se renderiza (el componente padre lo oculta).
 *                                  Es solo soldadura por naturaleza.
 *
 * Cuando se renderiza pero no hay tipoFalla elegido, se asume "AMBAS"
 * en la query (el backend hace lo mismo si tipoFalla viene undefined).
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TipoFallaFiltro } from '@/lib/types/enums/fallas.enum';

interface SelectorTipoFallaProps {
  value: TipoFallaFiltro | undefined;
  onChange: (v: TipoFallaFiltro) => void;
  disabled?: boolean;
}

const LABELS: Record<TipoFallaFiltro, string> = {
  [TipoFallaFiltro.AMBAS]: 'Riel + Soldadura',
  [TipoFallaFiltro.RIEL]: 'Solo Riel',
  [TipoFallaFiltro.SOLDADURA]: 'Solo Soldadura',
};

export function SelectorTipoFallaFallas({
  value,
  onChange,
  disabled,
}: SelectorTipoFallaProps) {
  return (
    <Select
      value={value ?? ''}
      disabled={disabled}
      onValueChange={(v) => onChange(v as TipoFallaFiltro)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona tipo de falla" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TipoFallaFiltro.AMBAS}>{LABELS.AMBAS}</SelectItem>
        <SelectItem value={TipoFallaFiltro.RIEL}>{LABELS.RIEL}</SelectItem>
        <SelectItem value={TipoFallaFiltro.SOLDADURA}>{LABELS.SOLDADURA}</SelectItem>
      </SelectContent>
    </Select>
  );
}