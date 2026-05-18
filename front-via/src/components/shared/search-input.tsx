// frontend/src/components/shared/search-input.tsx

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Ancho mínimo del input. Por defecto: 200px. */
  minWidth?: number;
}

/**
 * Input de búsqueda estándar con icono de lupa y botón "limpiar".
 * Pensado para ir dentro de <DataToolbar/>.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  className,
  minWidth = 200,
}: SearchInputProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{ minWidth }}
    >
      <Search
        className="
          pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5
          -translate-y-1/2 text-muted-foreground
        "
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 bg-background pl-8 pr-7 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            rounded-sm p-0.5 text-muted-foreground transition-colors
            hover:bg-muted hover:text-foreground
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
