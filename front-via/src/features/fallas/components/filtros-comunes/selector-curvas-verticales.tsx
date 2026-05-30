import { MultiSelect } from '@/components/ui/multi-select';
import { useCurvasVerticalesOptions } from '@/hooks/use-curvas-verticales-options';

interface SelectorCurvasVerticalesProps {
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  viaFiltro?: string;
}

export function SelectorCurvasVerticales({
  value,
  onChange,
  placeholder = 'Seleccionar curvas verticales...',
  viaFiltro,
}: SelectorCurvasVerticalesProps) {
  const { options } = useCurvasVerticalesOptions(viaFiltro);

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