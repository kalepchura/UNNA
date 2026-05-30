// frontend/src/features/fallas/components/filtros-comunes/selector-elementos.tsx

import { cn } from '@/lib/utils';
import { MultiSelect } from '@/components/ui/multi-select';
import { useElementosPorNivel } from '@/features/fallas/hooks/use-elementos-por-nivel';
import {
  NivelAnalisis,
  TipoViaFiltroFallas,
  LABEL_NIVEL,
} from '@/lib/types/enums/fallas-graficos.enum';

interface SelectorElementosProps {
  nivel: NivelAnalisis | undefined;
  via: TipoViaFiltroFallas | undefined;
  value: number[];
  onChange: (ids: number[]) => void;
  hasError?: boolean;
  mostrarSeleccionarTodos?: boolean;
}

export function SelectorElementos({
  nivel,
  via,
  value,
  onChange,
  hasError = false,
  mostrarSeleccionarTodos = false,
}: SelectorElementosProps) {
  const { options, isLoading, labelElementos } = useElementosPorNivel(nivel, via);

  const labelSingular = nivel ? LABEL_NIVEL[nivel].toLowerCase() : 'elemento';

  if (!nivel) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Selecciona primero un nivel de análisis.
      </p>
    );
  }

  return (
    <div
      className={cn(
        'rounded-md transition-shadow',
        hasError && 'ring-1 ring-red-500 [&_button]:border-red-500',
      )}
    >
      <MultiSelect
        options={options}
        selected={value.map(String)}
        onChange={(values) => onChange(values.map(Number))}
        placeholder={
          isLoading
            ? 'Cargando...'
            : `Seleccionar ${labelElementos.toLowerCase()}...`
        }
        itemLabelSingular={labelSingular}
        showAllOption={mostrarSeleccionarTodos && options.length > 1}
        allOptionLabel={`Todos los ${labelSingular}s`}
      />
    </div>
    // NOTA: el mensaje de error lo muestra FilterField.error,
    // no este componente — así se evita la duplicación.
  );
}