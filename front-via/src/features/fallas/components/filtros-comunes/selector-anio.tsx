// frontend/src/features/fallas/components/filtros-comunes/selector-anio.tsx

import { useMemo } from 'react';
import { Combobox } from '@/components/forms/combobox';
import { cn } from '@/lib/utils';

const ANIO_MIN = 2012;
const ANIO_MAX = 2100;

interface SelectorAnioProps {
  value: number | undefined;
  onChange: (anio: number) => void;
  placeholder?: string;
  disabled?: boolean;
  minAnio?: number;
  /** Si true, aplica borde rojo al control. */
  hasError?: boolean;
}

export function SelectorAnio({
  value,
  onChange,
  placeholder = 'Selecciona un año',
  disabled,
  minAnio,
  hasError = false,
}: SelectorAnioProps) {
  const options = useMemo(() => {
    const desde = minAnio ?? ANIO_MIN;
    const lista: { value: string; label: string }[] = [];
    for (let a = desde; a <= ANIO_MAX; a++) {
      lista.push({ value: String(a), label: String(a) });
    }
    return lista;
  }, [minAnio]);

  return (
    // Wrapper que aplica el anillo rojo sobre el Combobox sin tocarlo internamente
    <div
      className={cn(
        'rounded-md transition-shadow',
        hasError && 'ring-1 ring-red-500 [&_button]:border-red-500',
      )}
    >
      <Combobox
        options={options}
        value={value !== undefined ? String(value) : undefined}
        onChange={(v) => onChange(Number(v))}
        placeholder={placeholder}
        searchPlaceholder="Buscar año..."
        disabled={disabled}
      />
    </div>
  );
}