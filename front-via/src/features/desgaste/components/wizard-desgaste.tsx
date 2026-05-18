import { useState, useEffect } from 'react';

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
import { desgasteApi } from '@/lib/api/desgaste.api';

import type { ComboboxOption } from '@/components/forms/combobox';
import type { Grafico1DesgasteFiltros } from '../types/grafico-1.types';

interface WizardProps {
  onConfigurar: (config: Grafico1DesgasteFiltros) => void;
}

interface OpcionWizard {
  id: number;
  etiqueta: string;
}

export function WizardDesgaste({ onConfigurar }: WizardProps) {
  const [paso, setPaso] = useState(1);

  const [tipoAgrupacion, setTipoAgrupacion] =
    useState<string>('TRAMO');

  const [agrupacionId, setAgrupacionId] =
    useState<number | null>(null);

  const [via, setVia] =
    useState<string>('AMBAS');

  const [elementos, setElementos] =
    useState<number[]>([]);

  const [puntosW, setPuntosW] =
    useState<string[]>(['W1']);

  /**
   * ✅ Limpieza automática
   * Cuando cambia el tipo principal,
   * reiniciamos estados dependientes.
   */
  useEffect(() => {
    setAgrupacionId(null);
    setElementos([]);
  }, [tipoAgrupacion]);

  /**
   * Paso 1 (estático)
   */
  const opcionesPaso1: OpcionWizard[] = [
    { id: 0, etiqueta: 'Tramo' },
    { id: 1, etiqueta: 'Curva horizontal' },
    { id: 2, etiqueta: 'Curva vertical' },
  ];

  /**
   * Paso 2
   * Obtener agrupaciones
   */
  const { data: dataPaso2 } = useApiQuery({
    queryKey: [
      'desgaste',
      'wizard',
      'paso2',
      tipoAgrupacion,
    ],

    queryFn: () =>
      desgasteApi.wizard.obtenerOpciones({
        paso: 2,
        tipoAgrupacion: tipoAgrupacion as any,
      }),

    enabled: paso >= 2,
  });

  /**
   * Paso 4
   * Obtener elementos
   */
  const { data: dataPaso4 } = useApiQuery({
    queryKey: [
      'desgaste',
      'wizard',
      'paso4',
      tipoAgrupacion,
      agrupacionId,
      via,
    ],

    queryFn: () =>
      desgasteApi.wizard.obtenerOpciones({
        paso: 4,
        tipoAgrupacion: tipoAgrupacion as any,
        agrupacionId: agrupacionId!,
        via: via as any,
      }),

    enabled:
      paso >= 4 &&
      agrupacionId !== null,
  });

  /**
   * Opciones paso 2
   */
  const opcionesPaso2: ComboboxOption[] =
    dataPaso2?.opciones?.map(
      (o: OpcionWizard) => ({
        value: String(o.id),
        label: o.etiqueta,
      }),
    ) ?? [];

  /**
   * Opciones paso 4
   */
  const opcionesPaso4: ComboboxOption[] =
    dataPaso4?.opciones?.map(
      (o: OpcionWizard) => ({
        value: String(o.id),
        label: o.etiqueta,
      }),
    ) ?? [];

  /**
   * Navegación siguiente
   */
  const handleSiguiente = () => {
    if (paso < 5) {
      setPaso(paso + 1);
      return;
    }

    /**
     * Construcción final
     */
    const config: Grafico1DesgasteFiltros = {
      tipoAgrupacion: tipoAgrupacion as any,
      via: via as any,
      elementoCodigos: elementos,
      puntosW: puntosW as any,
    };

    if (tipoAgrupacion === 'TRAMO') {
      config.tramoId = agrupacionId!;
    }

    else if (
      tipoAgrupacion === 'CURVA_HORIZONTAL'
    ) {
      config.curvaHorizontalId =
        agrupacionId!;
    }

    else if (
      tipoAgrupacion === 'CURVA_VERTICAL'
    ) {
      config.curvaVerticalId =
        agrupacionId!;
    }

    onConfigurar(config);
  };

  /**
   * Validaciones por paso
   */
  const puedeAvanzar = () => {
    switch (paso) {
      case 1:
        return true;

      case 2:
        return agrupacionId !== null;

      case 3:
        return true;

      case 4:
        return true;

      case 5:
        return puntosW.length > 0;

      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Asistente de configuración — Paso {paso} de 5
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* PASO 1 */}
        {paso === 1 && (
          <div>
            <Label>
              Tipo de agrupación
            </Label>

            <Select
              value={tipoAgrupacion}
              onValueChange={setTipoAgrupacion}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {opcionesPaso1.map((op) => (
                  <SelectItem
                    key={op.id}
                    value={op.etiqueta
                      .toUpperCase()
                      .replace(' ', '_')}
                  >
                    {op.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div>
            <Label>
              {tipoAgrupacion === 'TRAMO'
                ? 'Tramo'
                : tipoAgrupacion ===
                  'CURVA_HORIZONTAL'
                  ? 'Curva horizontal'
                  : 'Curva vertical'}
            </Label>

            <Select
              value={
                agrupacionId !== null
                  ? String(agrupacionId)
                  : undefined
              }

              onValueChange={(v) =>
                setAgrupacionId(Number(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>

              <SelectContent>
                {opcionesPaso2.map((op) => (
                  <SelectItem
                    key={op.value}
                    value={op.value}
                  >
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div>
            <Label>Vía</Label>

            <Select
              value={via}
              onValueChange={setVia}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="AMBAS">
                  Ambas
                </SelectItem>

                <SelectItem value="PAR">
                  Par
                </SelectItem>

                <SelectItem value="IMPAR">
                  Impar
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* PASO 4 */}
        {paso === 4 && (
          <div>
            <Label>Elementos</Label>

            <MultiSelect
              options={opcionesPaso4}

              selected={elementos.map(String)}

              onChange={(values) =>
                setElementos(
                  values.map(Number),
                )
              }

              placeholder="Seleccionar elementos..."

              showAllOption

              allOptionLabel="Todos los elementos"
            />
          </div>
        )}

        {/* PASO 5 */}
        {paso === 5 && (
          <div>
            <Label>
              Puntos de medición
            </Label>

            <MultiSelect
              options={[
                {
                  value: 'W1',
                  label: 'W1',
                },
                {
                  value: 'W2',
                  label: 'W2',
                },
                {
                  value: 'W3R',
                  label: 'W3R',
                },
                {
                  value: 'W3L',
                  label: 'W3L',
                },
              ]}

              selected={puntosW}

              onChange={setPuntosW}

              placeholder="Seleccionar puntos..."

              showAllOption

              allOptionLabel="Todos los puntos"
            />
          </div>
        )}

        {/* BOTONES */}
        <div className="flex justify-between">

          <Button
            variant="outline"

            disabled={paso === 1}

            onClick={() =>
              setPaso(paso - 1)
            }
          >
            Anterior
          </Button>

          <Button
            onClick={handleSiguiente}

            disabled={!puedeAvanzar()}
          >
            {paso === 5
              ? 'Aplicar'
              : 'Siguiente'}
          </Button>

        </div>
      </CardContent>
    </Card>
  );
}