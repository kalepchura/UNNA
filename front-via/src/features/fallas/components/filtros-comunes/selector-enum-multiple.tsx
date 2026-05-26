/**
 * Selector genérico para multi-select de valores de enum.
 *
 * Centraliza el patrón usado por los 5 selectores de Fase 2.D:
 *  - SelectorTipoDefecto
 *  - SelectorElementoAfectado
 *  - SelectorZonaAfectada
 *  - SelectorPerfil
 *  - SelectorEstadoActual
 *
 * Cada uno es un wrapper de 4 líneas alrededor de este componente.
 *
 * Patrón:
 *  - El valor es string[] (los enums son strings)
 *  - Recibe el diccionario LABEL_* para mostrar etiquetas legibles
 *  - No tiene opción "Todos" por default (los enums son listas cortas;
 *    seleccionar "todos" es lo mismo que no filtrar)
 */

import { MultiSelect } from '@/components/ui/multi-select';

interface SelectorEnumMultipleProps<T extends string> {
  /** Valor actual seleccionado (array de valores del enum). */
  value: T[];
  /** Handler de cambio. */
  onChange: (valores: T[]) => void;
  /**
   * Diccionario de labels para mostrar.
   * Ej: LABEL_TIPO_DEFECTO de fallas.enum.ts
   */
  labels: Record<T, string>;
  /** Placeholder del botón. */
  placeholder?: string;
  /** Texto en singular para "N seleccionado". */
  itemLabelSingular?: string;
  /** Texto en plural. */
  itemLabelPlural?: string;
  /** Texto debajo del selector cuando no hay nada seleccionado. */
  helperVacio?: string;
  /** Si true, muestra opción "Todos" arriba. Default: false. */
  showAllOption?: boolean;
  /** Etiqueta de la opción "Todos". */
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
  showAllOption = false,
  allOptionLabel = 'Todos',
}: SelectorEnumMultipleProps<T>) {
  // Convertir el diccionario en array de options para MultiSelect
  const options = (Object.entries(labels) as Array<[T, string]>).map(
    ([valor, label]) => ({
      value: valor,
      label,
    }),
  );

  return (
    <>
      <MultiSelect
        options={options}
        selected={value}
        onChange={(values) => onChange(values as T[])}
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