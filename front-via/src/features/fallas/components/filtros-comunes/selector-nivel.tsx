// frontend/src/features/fallas/components/filtros-comunes/selector-nivel.tsx

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  NivelAnalisis,
  LABEL_NIVEL,
} from '@/lib/types/enums/fallas-graficos.enum';

interface SelectorNivelProps {
  value: NivelAnalisis | undefined;
  onChange: (nivel: NivelAnalisis) => void;
  disabled?: boolean;
  /** Si true, aplica borde rojo al trigger. */
  hasError?: boolean;
}

const ORDEN_NIVELES: NivelAnalisis[] = [
  NivelAnalisis.TRAMO,
  NivelAnalisis.CURVA_H,
  NivelAnalisis.CURVA_V,
  NivelAnalisis.CAMBIAVIA,
];

export function SelectorNivel({
  value,
  onChange,
  disabled,
  hasError = false,
}: SelectorNivelProps) {
  return (
    <Select
      value={value ?? ''}
      disabled={disabled}
      onValueChange={(v) => onChange(v as NivelAnalisis)}
    >
      <SelectTrigger
        className={cn(hasError && 'border-red-500 ring-1 ring-red-200')}
      >
        <SelectValue placeholder="Selecciona un nivel" />
      </SelectTrigger>
      <SelectContent>
        {ORDEN_NIVELES.map((n) => (
          <SelectItem key={n} value={n}>
            {LABEL_NIVEL[n]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}