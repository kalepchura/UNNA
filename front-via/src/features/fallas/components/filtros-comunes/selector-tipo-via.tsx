/**
 * Selector reutilizable de tipo de vía.
 * Opciones: Ambas / Vía Par / Vía Impar.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectorTipoViaProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SelectorTipoVia({
  value,
  onChange,
  placeholder = 'Selecciona vía',
  disabled,
}: SelectorTipoViaProps) {
  return (
    <Select value={value ?? ''} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="AMBAS">Ambas</SelectItem>
        <SelectItem value="PAR">Vía Par</SelectItem>
        <SelectItem value="IMPAR">Vía Impar</SelectItem>
      </SelectContent>
    </Select>
  );
}