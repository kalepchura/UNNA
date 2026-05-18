import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  /** Lista de opciones disponibles. */
  options: Option[];
  /** Valores actualmente seleccionados. */
  selected: string[];
  /** Callback cuando cambia la selección. */
  onChange: (selected: string[]) => void;

  /** Texto cuando no hay selección. Default: "Seleccionar...". */
  placeholder?: string;
  /** Placeholder del input de búsqueda. Default: "Buscar...". */
  searchPlaceholder?: string;
  /** Mensaje cuando la búsqueda no devuelve resultados. Default: "No se encontraron resultados.". */
  emptyMessage?: string;

  /** Si true, muestra una opción "Todos" arriba que selecciona/deselecciona todo. */
  showAllOption?: boolean;
  /** Texto de la opción "Todos". Default: "Todos". */
  allOptionLabel?: string;

  /**
   * Sustantivo en singular para el contador de seleccionados.
   * Default: "elemento". Ejemplo con "tramo":
   *   - 1 seleccionado → "1 tramo seleccionado"
   *   - 3 seleccionados → "3 tramos seleccionados"
   */
  itemLabelSingular?: string;
  /**
   * Sustantivo en plural. Si no se proporciona, se agrega "s" al singular.
   * Útil para palabras irregulares ("curva" → "curvas" funciona automático,
   * "país" → "países" requiere proporcionar el plural).
   */
  itemLabelPlural?: string;
}

/**
 * Selector múltiple con búsqueda y opción "Todos".
 *
 * Componente genérico reutilizable: sirve para tramos, cambiavías,
 * curvas, acciones, o cualquier lista de opciones de tipo
 * { value: string; label: string }.
 *
 * @example
 *   // Filtro de tramos
 *   <MultiSelect
 *     options={tramosOptions}
 *     selected={tramosSeleccionados}
 *     onChange={setTramosSeleccionados}
 *     showAllOption
 *     allOptionLabel="Todos los tramos"
 *     itemLabelSingular="tramo"
 *   />
 *
 * @example
 *   // Filtro de cambiavías
 *   <MultiSelect
 *     options={cambiaviasOptions}
 *     selected={cambiaviasSeleccionados}
 *     onChange={setCambiaviasSeleccionados}
 *     itemLabelSingular="cambiavía"
 *     itemLabelPlural="cambiavías"
 *   />
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  showAllOption = false,
  allOptionLabel = "Todos",
  itemLabelSingular = "elemento",
  itemLabelPlural,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const isAllSelected =
    selected.length === options.length && options.length > 0;

  const handleSelect = (value: string) => {
    if (value === "all") {
      if (isAllSelected) {
        onChange([]);
      } else {
        onChange(options.map((o) => o.value));
      }
      return;
    }

    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  /**
   * Texto del botón:
   * - Sin selección → placeholder
   * - Todo seleccionado → allOptionLabel
   * - Selección parcial → "N <singular/plural> seleccionado/s"
   */
  const getButtonText = () => {
    if (isAllSelected) {
      return allOptionLabel;
    }
    if (selected.length === 0) {
      return placeholder;
    }

    // Resolver plural: si no se pasó, agregar "s"
    const plural = itemLabelPlural ?? `${itemLabelSingular}s`;
    const sustantivo = selected.length === 1 ? itemLabelSingular : plural;
    const adjetivo = selected.length === 1 ? "seleccionado" : "seleccionados";

    return `${selected.length} ${sustantivo} ${adjetivo}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{getButtonText()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  key="all"
                  value="all"
                  onSelect={() => handleSelect("all")}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isAllSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {allOptionLabel}
                </CommandItem>
              )}
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}