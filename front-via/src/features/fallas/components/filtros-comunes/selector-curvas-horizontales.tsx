/**
 * Selector reutilizable de curvas horizontales (multi-select con opción "Todas").
 * Mismo patrón que SelectorTramos: encapsula la conversión number[] ↔ string[].
 *
 * Usado en filtros de los 3 gráficos (Fase 1 — filtro de curva H).
 */

import { MultiSelect } from '@/components/ui/multi-select';
import { useCurvasHorizontalesOptions } from '@/hooks/use-curvas-horizontales-options';

interface SelectorCurvasHorizontalesProps {
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

export function SelectorCurvasHorizontales({
  value,
  onChange,
  placeholder = 'Seleccionar curvas horizontales...',
}: SelectorCurvasHorizontalesProps) {
  const { options } = useCurvasHorizontalesOptions();

  return (
    <>
      <MultiSelect
        options={options}
        selected={value.map(String)}
        onChange={(values) => onChange(values.map(Number))}
        placeholder={placeholder}
        showAllOption
        allOptionLabel="Todas las curvas horizontales"
        itemLabelSingular="curva horizontal"
        itemLabelPlural="curvas horizontales"
      />
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Mostrando todas las curvas horizontales
        </p>
      )}
    </>
  );
}