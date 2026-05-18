/**
 * Selector de año reutilizable.
 *
 * Combobox con búsqueda que ofrece todos los años entre ANIO_MIN
 * y ANIO_MAX. Útil porque listar 89 años en un Select normal es
 * incómodo, mientras que un Combobox permite escribir "2026" y
 * filtrar al instante.
 *
 * Usado por:
 *  - grafico-1-filtros.tsx (año único, año inicio, año fin)
 *  - (futuros gráficos con filtro de año)
 */

import { useMemo } from 'react';
import { Combobox } from '@/components/forms/combobox';

const ANIO_MIN = 2012;
const ANIO_MAX = 2100;

interface SelectorAnioProps {
  /** Año seleccionado actualmente. Si es undefined, no hay selección. */
  value: number | undefined;
  /** Handler cuando el usuario selecciona un año. */
  onChange: (anio: number) => void;
  /** Texto cuando no hay selección. */
  placeholder?: string;
  /** Si está deshabilitado. */
  disabled?: boolean;
  /**
   * Año mínimo permitido (override del default).
   * Útil para "año fin": si año inicio es 2020, año fin debe ser ≥ 2020.
   */
  minAnio?: number;
}

export function SelectorAnio({
  value,
  onChange,
  placeholder = 'Selecciona un año',
  disabled,
  minAnio,
}: SelectorAnioProps) {
  // Generar opciones [2012, 2013, ..., 2100] (o desde minAnio si se especifica)
  const options = useMemo(() => {
    const desde = minAnio ?? ANIO_MIN;
    const lista: { value: string; label: string }[] = [];
    for (let a = desde; a <= ANIO_MAX; a++) {
      lista.push({ value: String(a), label: String(a) });
    }
    return lista;
  }, [minAnio]);

  return (
    <Combobox
      options={options}
      value={value !== undefined ? String(value) : undefined}
      onChange={(v) => onChange(Number(v))}
      placeholder={placeholder}
      searchPlaceholder="Buscar año..."
      disabled={disabled}
    />
  );
}