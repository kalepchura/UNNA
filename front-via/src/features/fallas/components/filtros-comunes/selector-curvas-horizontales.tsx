import { MultiSelect } from '@/components/ui/multi-select';
import { useCurvasHorizontalesOptions } from '@/hooks/use-curvas-horizontales-options';

interface SelectorCurvasHorizontalesProps {
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  viaFiltro?: string;
}

export function SelectorCurvasHorizontales({
  value,
  onChange,
  placeholder = 'Seleccionar curvas horizontales...',
  viaFiltro,
}: SelectorCurvasHorizontalesProps) {
  const { options } = useCurvasHorizontalesOptions(viaFiltro);

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