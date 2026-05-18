import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { useApiQuery } from '@/hooks/use-api-query';
import { useEscenariosOptions } from '@/hooks/use-escenarios-options';
import { desgasteApi } from '@/lib/api/desgaste.api';
import type { ComboboxOption } from '@/components/forms/combobox';
import type { Grafico3DesgasteFiltros } from '../types/grafico-3.types';

interface WizardG3Props {
  onConfigurar: (config: Grafico3DesgasteFiltros) => void;
}

export function WizardDesgasteG3({ onConfigurar }: WizardG3Props) {
  const [paso, setPaso] = useState(1);
  const [tipoAgrupacion, setTipoAgrupacion] = useState<string>('TRAMO');
  const [agrupacionId, setAgrupacionId] = useState<number | null>(null);
  const [via, setVia] = useState<string>('AMBAS');
  const [elementos, setElementos] = useState<number[]>([]);
  const [puntosW, setPuntosW] = useState<string[]>(['W1']);
  const [escenarioId, setEscenarioId] = useState<number | null>(null);

  const { options: escenariosOptions } = useEscenariosOptions();

  // Paso 2: opciones de agrupación
  const { data: dataPaso2 } = useApiQuery({
    queryKey: ['desgaste', 'wizard', 'paso2', tipoAgrupacion],
    queryFn: () =>
      desgasteApi.wizard.obtenerOpciones({ paso: 2, tipoAgrupacion: tipoAgrupacion as any }),
    enabled: paso >= 2,
  });

  // Paso 4: elementos
  const { data: dataPaso4 } = useApiQuery({
    queryKey: ['desgaste', 'wizard', 'paso4', tipoAgrupacion, agrupacionId, via],
    queryFn: () =>
      desgasteApi.wizard.obtenerOpciones({
        paso: 4,
        tipoAgrupacion: tipoAgrupacion as any,
        agrupacionId: agrupacionId!,
        via: via as any,
      }),
    enabled: paso >= 4 && agrupacionId !== null,
  });

  const opcionesPaso2: ComboboxOption[] =
    dataPaso2?.opciones?.map((o: any) => ({ value: String(o.id), label: o.etiqueta })) ?? [];
  const opcionesPaso4: ComboboxOption[] =
    dataPaso4?.opciones?.map((o: any) => ({ value: String(o.id), label: o.etiqueta })) ?? [];

  const handleSiguiente = () => {
    if (paso < 6) setPaso(paso + 1);
    else {
      const config: Grafico3DesgasteFiltros = {
        tipoAgrupacion: tipoAgrupacion as any,
        via: via as any,
        elementoCodigos: elementos,
        puntosW: puntosW as any,
        escenarioId: escenarioId!,
      };
      if (tipoAgrupacion === 'TRAMO') config.tramoId = agrupacionId!;
      else if (tipoAgrupacion === 'CURVA_HORIZONTAL') config.curvaHorizontalId = agrupacionId!;
      else if (tipoAgrupacion === 'CURVA_VERTICAL') config.curvaVerticalId = agrupacionId!;
      onConfigurar(config);
    }
  };

  const puedeAvanzar = () => {
    switch (paso) {
      case 1: return true;
      case 2: return agrupacionId !== null;
      case 3: return true;
      case 4: return true;
      case 5: return puntosW.length > 0;
      case 6: return escenarioId !== null;
      default: return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistente de configuración — Paso {paso} de 6</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paso === 1 && (
          <div>
            <Label>Tipo de agrupación</Label>
            <Select value={tipoAgrupacion} onValueChange={setTipoAgrupacion}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TRAMO">Tramo</SelectItem>
                <SelectItem value="CURVA_HORIZONTAL">Curva horizontal</SelectItem>
                <SelectItem value="CURVA_VERTICAL">Curva vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {paso === 2 && (
          <div>
            <Label>
              {tipoAgrupacion === 'TRAMO'
                ? 'Tramo'
                : tipoAgrupacion === 'CURVA_HORIZONTAL'
                ? 'Curva horizontal'
                : 'Curva vertical'}
            </Label>
            <Select
              value={agrupacionId !== null ? String(agrupacionId) : undefined}
              onValueChange={(v) => setAgrupacionId(Number(v))}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {opcionesPaso2.map((op) => (
                  <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {paso === 3 && (
          <div>
            <Label>Vía</Label>
            <Select value={via} onValueChange={setVia}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AMBAS">Ambas</SelectItem>
                <SelectItem value="PAR">Par</SelectItem>
                <SelectItem value="IMPAR">Impar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {paso === 4 && (
          <div>
            <Label>Elementos</Label>
            <MultiSelect
              options={opcionesPaso4}
              selected={elementos.map(String)}
              onChange={(values) => setElementos(values.map(Number))}
              placeholder="Seleccionar elementos..."
              showAllOption
              allOptionLabel="Todos los elementos"
            />
          </div>
        )}

        {paso === 5 && (
          <div>
            <Label>Puntos de medición</Label>
            <MultiSelect
              options={[
                { value: 'W1', label: 'W1' },
                { value: 'W2', label: 'W2' },
                { value: 'W3R', label: 'W3R' },
                { value: 'W3L', label: 'W3L' },
              ]}
              selected={puntosW}
              onChange={setPuntosW}
              placeholder="Seleccionar puntos..."
              showAllOption
              allOptionLabel="Todos los puntos"
            />
          </div>
        )}

        {paso === 6 && (
          <div>
            <Label>Escenario</Label>
            <Select
              value={escenarioId !== null ? String(escenarioId) : undefined}
              onValueChange={(v) => setEscenarioId(Number(v))}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar escenario..." /></SelectTrigger>
              <SelectContent>
                {escenariosOptions.map((op) => (
                  <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" disabled={paso === 1} onClick={() => setPaso(paso - 1)}>
            Anterior
          </Button>
          <Button onClick={handleSiguiente} disabled={!puedeAvanzar()}>
            {paso === 6 ? 'Aplicar' : 'Siguiente'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}