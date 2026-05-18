/**
 * Selector reutilizable de tramos (multi-select con opción "Todos").
 * Encapsula la conversión number[] ↔ string[] necesaria para MultiSelect.
 */

import { MultiSelect } from '@/components/ui/multi-select';
import { useTramosOptions } from '@/hooks/use-tramos-options';

interface SelectorTramosProps {
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

export function SelectorTramos({
  value,
  onChange,
  placeholder = 'Seleccionar tramos...',
}: SelectorTramosProps) {
  const { options } = useTramosOptions();

  return (
    <>
      <MultiSelect
        options={options}
        selected={value.map(String)}
        onChange={(values) => onChange(values.map(Number))}
        placeholder={placeholder}
        showAllOption
        allOptionLabel="Todos los tramos"
      />
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Mostrando todos los tramos
        </p>
      )}
    </>
  );
}