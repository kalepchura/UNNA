import { MultiSelect } from '@/components/ui/multi-select';

interface SelectorEnumMultipleProps<T extends string> {
  value: T[];
  onChange: (valores: T[]) => void;
  labels: Record<T, string>;
  placeholder?: string;
  itemLabelSingular?: string;
  itemLabelPlural?: string;
  helperVacio?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function SelectorEnumMultiple<T extends string>({
  value,
  onChange,
  labels,
  placeholder = 'Seleccionar...',
  itemLabelSingular = 'opción',
  itemLabelPlural,
  helperVacio,
  showAllOption = true,
  allOptionLabel = 'Todos',
}: SelectorEnumMultipleProps<T>) {
  const options = (Object.entries(labels) as Array<[T, string]>).map(
    ([valor, label]) => ({ value: valor, label }),
  );

  // Cuando el usuario selecciona todos, normalizar a array vacío.
  // Array vacío = sin filtro en el backend.
  const handleChange = (values: string[]) => {
    if (values.length === options.length) {
      onChange([] as unknown as T[]);
    } else {
      onChange(values as T[]);
    }
  };

  return (
    <>
      <MultiSelect
        options={options}
        selected={value}
        onChange={handleChange}
        placeholder={placeholder}
        showAllOption={showAllOption}
        allOptionLabel={allOptionLabel}
        itemLabelSingular={itemLabelSingular}
        itemLabelPlural={itemLabelPlural}
      />
      {value.length === 0 && helperVacio && (
        <p className="text-xs text-muted-foreground mt-1">{helperVacio}</p>
      )}
    </>
  );
}