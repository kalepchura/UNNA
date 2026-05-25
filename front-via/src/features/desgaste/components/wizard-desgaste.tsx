import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  MapPin,
  Route,
  Settings2,
  Target,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';

import {
  FiltersToolbar,
  FilterField,
} from '@/components/shared/filters-toolbar';
import { Stepper, type Step } from '@/components/shared/stepper';
import {
  WizardStep,
  WizardSummary,
  type WizardSummaryItem,
} from '@/components/shared/wizard';

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

const STEPS: Step[] = [
  { label: 'Agrupación', description: 'Tramo o curva' },
  { label: 'Selección', description: 'Item específico' },
  { label: 'Vía', description: 'Par / Impar' },
  { label: 'Elementos', description: 'Filtrar elementos' },
  { label: 'Puntos', description: 'W1 · W2 · W3R · W3L' },
];

const TIPO_AGRUPACION_LABEL: Record<string, string> = {
  TRAMO: 'Tramo',
  CURVA_HORIZONTAL: 'Curva horizontal',
  CURVA_VERTICAL: 'Curva vertical',
};

const VIA_LABEL: Record<string, string> = {
  AMBAS: 'Ambas',
  PAR: 'Par',
  IMPAR: 'Impar',
};

export function WizardDesgaste({ onConfigurar }: WizardProps) {
  const [paso, setPaso] = useState(1);
  const [tipoAgrupacion, setTipoAgrupacion] = useState<string>('TRAMO');
  const [agrupacionId, setAgrupacionId] = useState<number | null>(null);
  const [via, setVia] = useState<string>('AMBAS');
  const [elementos, setElementos] = useState<number[]>([]);
  const [puntosW, setPuntosW] = useState<string[]>(['W1']);

  // Al cambiar tipo, limpiar dependientes
  useEffect(() => {
    setAgrupacionId(null);
    setElementos([]);
  }, [tipoAgrupacion]);

  // Paso 2 — opciones de agrupación
  const { data: dataPaso2 } = useApiQuery({
    queryKey: ['desgaste', 'wizard', 'paso2', tipoAgrupacion],
    queryFn: () =>
      desgasteApi.wizard.obtenerOpciones({
        paso: 2,
        tipoAgrupacion: tipoAgrupacion as any,
      }),
    enabled: paso >= 2,
  });

  // Paso 4 — opciones de elementos
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
    enabled: paso >= 4 && agrupacionId !== null,
  });

  const opcionesPaso2: ComboboxOption[] =
    dataPaso2?.opciones?.map((o: OpcionWizard) => ({
      value: String(o.id),
      label: o.etiqueta,
    })) ?? [];

  const opcionesPaso4: ComboboxOption[] =
    dataPaso4?.opciones?.map((o: OpcionWizard) => ({
      value: String(o.id),
      label: o.etiqueta,
    })) ?? [];

  const handleSiguiente = () => {
    if (paso < STEPS.length) {
      setPaso(paso + 1);
      return;
    }
    const config: Grafico1DesgasteFiltros = {
      tipoAgrupacion: tipoAgrupacion as any,
      via: via as any,
      elementoCodigos: elementos,
      puntosW: puntosW as any,
    };
    if (tipoAgrupacion === 'TRAMO') config.tramoId = agrupacionId!;
    else if (tipoAgrupacion === 'CURVA_HORIZONTAL')
      config.curvaHorizontalId = agrupacionId!;
    else if (tipoAgrupacion === 'CURVA_VERTICAL')
      config.curvaVerticalId = agrupacionId!;
    onConfigurar(config);
  };

  const puedeAvanzar = () => {
    switch (paso) {
      case 1: return true;
      case 2: return agrupacionId !== null;
      case 3: return true;
      case 4: return true;
      case 5: return puntosW.length > 0;
      default: return false;
    }
  };

  const labelAgrupacion = TIPO_AGRUPACION_LABEL[tipoAgrupacion] ?? '—';
  const esUltimoPaso = paso === STEPS.length;

  // Valor humano-legible de la agrupación seleccionada
  const agrupacionLabel =
    agrupacionId !== null
      ? opcionesPaso2.find((o) => o.value === String(agrupacionId))?.label
      : undefined;

  // Construye el resumen
  const summaryItems: WizardSummaryItem[] = [
    {
      label: 'Agrupación',
      value: labelAgrupacion,
      tone: 'completed',
    },
    {
      label: 'Selección',
      value: agrupacionLabel,
      tone: agrupacionLabel
        ? 'completed'
        : paso === 2
          ? 'current'
          : 'pending',
    },
    {
      label: 'Vía',
      value: VIA_LABEL[via],
      tone: paso >= 3 ? 'completed' : paso === 3 ? 'current' : 'pending',
    },
    {
      label: 'Elementos',
      value:
        elementos.length === 0
          ? 'Todos'
          : `${elementos.length} seleccionado${elementos.length === 1 ? '' : 's'}`,
      tone: paso >= 4 ? 'completed' : paso === 4 ? 'current' : 'pending',
    },
    {
      label: 'Puntos',
      value:
        puntosW.length === 0 ? undefined : puntosW.join(' · '),
      tone:
        puntosW.length > 0 && paso >= 5
          ? 'completed'
          : paso === 5
            ? 'current'
            : 'pending',
    },
  ];

  return (
    <FiltersToolbar
      title="Asistente de configuración"
      description={`Define los parámetros del gráfico paso a paso.`}
      variant="flush"
      primaryAction={
        <Button onClick={handleSiguiente} disabled={!puedeAvanzar()} size="sm">
          {esUltimoPaso ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Aplicar
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      }
      secondaryAction={
        <Button
          variant="outline"
          size="sm"
          disabled={paso === 1}
          onClick={() => setPaso(paso - 1)}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Anterior
        </Button>
      }
    >
      {/* Stepper horizontal */}
      <Stepper
        steps={STEPS}
        currentStep={paso}
        onStepClick={(idx) => setPaso(idx + 1)}
        className="mb-8"
      />

      {/* Contenido del paso actual */}
      {paso === 1 && (
        <WizardStep
          stepNumber={1}
          totalSteps={STEPS.length}
          icon={Layers}
          title="¿Cómo querés agrupar?"
          description="Elige si vas a analizar un tramo entero o una curva específica. Esto define el universo de elementos a evaluar."
        >
          <FilterField label="Tipo de agrupación">
            <Select
              value={tipoAgrupacion}
              onValueChange={setTipoAgrupacion}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRAMO">Tramo</SelectItem>
                <SelectItem value="CURVA_HORIZONTAL">
                  Curva horizontal
                </SelectItem>
                <SelectItem value="CURVA_VERTICAL">
                  Curva vertical
                </SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
        </WizardStep>
      )}

      {paso === 2 && (
        <WizardStep
          stepNumber={2}
          totalSteps={STEPS.length}
          icon={MapPin}
          title={`Seleccioná un ${labelAgrupacion.toLowerCase()}`}
          description={`Elige el ${labelAgrupacion.toLowerCase()} específico que querés analizar.`}
        >
          <FilterField label={labelAgrupacion}>
            <Select
              value={agrupacionId !== null ? String(agrupacionId) : undefined}
              onValueChange={(v) => setAgrupacionId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {opcionesPaso2.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </WizardStep>
      )}

      {paso === 3 && (
        <WizardStep
          stepNumber={3}
          totalSteps={STEPS.length}
          icon={Route}
          title="¿Qué vía analizar?"
          description="Filtra por tipo de vía. Si elegís Ambas, se incluyen elementos de ambas direcciones."
        >
          <FilterField label="Vía">
            <Select value={via} onValueChange={setVia}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AMBAS">Ambas</SelectItem>
                <SelectItem value="PAR">Par</SelectItem>
                <SelectItem value="IMPAR">Impar</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
        </WizardStep>
      )}

      {paso === 4 && (
        <WizardStep
          stepNumber={4}
          totalSteps={STEPS.length}
          icon={Target}
          title="Elementos específicos"
          description="Refina por elementos puntuales. Si no seleccionas, se incluyen todos los elementos del filtro anterior."
        >
          <FilterField label="Elementos">
            <MultiSelect
              options={opcionesPaso4}
              selected={elementos.map(String)}
              onChange={(values) => setElementos(values.map(Number))}
              placeholder="Seleccionar elementos…"
              showAllOption
              allOptionLabel="Todos los elementos"
            />
          </FilterField>
        </WizardStep>
      )}

      {paso === 5 && (
        <WizardStep
          stepNumber={5}
          totalSteps={STEPS.length}
          icon={Settings2}
          title="Puntos de medición"
          description="Cada punto W es una serie distinta en el gráfico. Selecciona uno o varios."
        >
          <FilterField label="Puntos">
            <MultiSelect
              options={[
                { value: 'W1', label: 'W1' },
                { value: 'W2', label: 'W2' },
                { value: 'W3R', label: 'W3R' },
                { value: 'W3L', label: 'W3L' },
              ]}
              selected={puntosW}
              onChange={setPuntosW}
              placeholder="Seleccionar puntos…"
              showAllOption
              allOptionLabel="Todos los puntos"
            />
          </FilterField>
        </WizardStep>
      )}

      {/* Resumen acumulativo */}
      <WizardSummary items={summaryItems} />
    </FiltersToolbar>
  );
}
