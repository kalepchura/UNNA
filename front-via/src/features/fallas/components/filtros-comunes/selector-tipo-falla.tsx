/**
 * Selector reutilizable de tipo de falla.
 * Opciones: Ambas / Solo Riel / Solo Soldadura.
 *
 * Usado en filtros de los 3 gráficos.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectorTipoFallaProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SelectorTipoFalla({
  value,
  onChange,
  placeholder = 'Selecciona tipo',
  disabled,
}: SelectorTipoFallaProps) {
  return (
    <Select value={value ?? ''} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="AMBAS">Ambas</SelectItem>
        <SelectItem value="RIEL">Solo Riel</SelectItem>
        <SelectItem value="SOLDADURA">Solo Soldadura</SelectItem>
      </SelectContent>
    </Select>
  );
}