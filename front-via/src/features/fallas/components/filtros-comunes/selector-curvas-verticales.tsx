/**
 * Selector reutilizable de curvas verticales (multi-select con opción "Todas").
 * Mismo patrón que SelectorTramos.
 *
 * Usado en filtros de los 3 gráficos (Fase 1 — filtro de curva V).
 */

import { MultiSelect } from '@/components/ui/multi-select';
import { useCurvasVerticalesOptions } from '@/hooks/use-curvas-verticales-options';

interface SelectorCurvasVerticalesProps {
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

export function SelectorCurvasVerticales({
  value,
  onChange,
  placeholder = 'Seleccionar curvas verticales...',
}: SelectorCurvasVerticalesProps) {
  const { options } = useCurvasVerticalesOptions();

  return (
    <>
      <MultiSelect
        options={options}
        selected={value.map(String)}
        onChange={(values) => onChange(values.map(Number))}
        placeholder={placeholder}
        showAllOption
        allOptionLabel="Todas las curvas verticales"
        itemLabelSingular="curva vertical"
        itemLabelPlural="curvas verticales"
      />
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Mostrando todas las curvas verticales
        </p>
      )}
    </>
  );
}