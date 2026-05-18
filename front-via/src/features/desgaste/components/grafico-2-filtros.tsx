import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { useEscenariosOptions } from '@/hooks/use-escenarios-options';
import type { Grafico2DesgasteFiltros } from '../types/grafico-2.types';

interface Props {
  config: Grafico2DesgasteFiltros;
  onChange: (config: Grafico2DesgasteFiltros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

export function FiltrosGrafico2Desgaste({
  config,
  onChange,
  onAplicar,
  isLoading,
}: Props) {
  const { options: escenariosOptions } = useEscenariosOptions();

  const escenarioIds = config.escenarioIds ?? [];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-sm font-medium">Escenarios</Label>
            <MultiSelect
              options={escenariosOptions}
              selected={escenarioIds.map(String)}
              onChange={(values) =>
                onChange({
                  ...config,
                  escenarioIds: values.map(Number),
                })
              }
              placeholder="Seleccionar escenarios..."
              showAllOption
              allOptionLabel="Todos los escenarios activos"
            />
            {escenarioIds.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Mostrando todos los escenarios
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onAplicar} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Aplicar Filtros'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}