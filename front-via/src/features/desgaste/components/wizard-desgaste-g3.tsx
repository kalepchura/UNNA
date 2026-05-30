import { useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  MapPin,
  Route,
  Settings2,
  Target,
  Activity,
  Plus,
  Trash2,
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
import { FilterField } from '@/components/shared/filters-toolbar';
import { Stepper, type Step } from '@/components/shared/stepper';
import {
  WizardStep,
  WizardSummary,
  type WizardSummaryItem,
} from '@/components/shared/wizard';

import { useApiQuery } from '@/hooks/use-api-query';
import { desgasteApi } from '@/lib/api/desgaste.api';
import { cn } from '@/lib/utils';

import type { WizardG3Block, Grafico3DesgasteRequest } from '../types/grafico-3.types';

// --- Constantes ---

const STEPS: Step[] = [
  { label: 'Agrupacion', description: 'Tramo o curva' },
  { label: 'Seleccion',  description: 'Uno o varios' },
  { label: 'Via',        description: 'Par / Impar' },
  { label: 'Elementos',  description: 'Filtrar elementos' },
  { label: 'Puntos',     description: 'W1 W2 W3R W3L' },
  { label: 'Escenario',  description: 'Uno o varios' },
];

const TIPO_LABEL: Record<string, string> = {
  TRAMO:            'Tramo',
  CURVA_HORIZONTAL: 'Curva horizontal',
  CURVA_VERTICAL:   'Curva vertical',
};

const VIA_LABEL: Record<string, string> = {
  AMBAS: 'Ambas',
  PAR:   'Par',
  IMPAR: 'Impar',
};

const PUNTOS_W_OPTIONS = [
  { value: 'W1',  label: 'W1' },
  { value: 'W2',  label: 'W2' },
  { value: 'W3R', label: 'W3R' },
  { value: 'W3L', label: 'W3L' },
];

// --- Helpers ---

let _blockCounter = 0;
function newBlockId() {
  return `block-${++_blockCounter}`;
}

export function crearBloquePorDefecto(): WizardG3Block {
  return {
    _id:             newBlockId(),
    tipoAgrupacion:  'TRAMO',
    agrupacionIds:   [],
    via:             'AMBAS',
    elementoCodigos: [],
    puntosW:         ['W1'],
    escenarioIds:    [],
    paso:            1,
  };
}

// --- Props ---

interface WizardDesgasteG3Props {
  onConfigurar: (request: Grafico3DesgasteRequest) => void;
  // Estado elevado al padre para sobrevivir al desmonte del Sheet
  bloques: WizardG3Block[];
  setBloques: React.Dispatch<React.SetStateAction<WizardG3Block[]>>;
  bloqueActivo: number;
  setBloqueActivo: React.Dispatch<React.SetStateAction<number>>;
}

// --- Componente principal ---

export function WizardDesgasteG3({
  onConfigurar,
  bloques,
  setBloques,
  bloqueActivo,
  setBloqueActivo,
}: WizardDesgasteG3Props) {

  const bloque = bloques[bloqueActivo];

  // Mutacion de un campo del bloque activo
  const actualizar = useCallback(
    <K extends keyof WizardG3Block>(campo: K, valor: WizardG3Block[K]) => {
      setBloques((prev) =>
        prev.map((b, i) => (i === bloqueActivo ? { ...b, [campo]: valor } : b)),
      );
    },
    [bloqueActivo, setBloques],
  );

  // Limpiar dependientes al cambiar tipo de agrupacion
  useEffect(() => {
    setBloques((prev) =>
      prev.map((b, i) =>
        i === bloqueActivo
          ? { ...b, agrupacionIds: [], elementoCodigos: [] }
          : b,
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloque?.tipoAgrupacion, bloqueActivo]);

  // Opciones del wizard paso 2 y paso 4
  const { data: dataPaso2 } = useApiQuery({
    queryKey: ['desgaste', 'wizard', 'paso2', bloque?.tipoAgrupacion],
    queryFn: () =>
      desgasteApi.wizard.obtenerOpciones({
        paso: 2,
        tipoAgrupacion: bloque.tipoAgrupacion,
      }),
    enabled: !!bloque && bloque.paso >= 2,
  });

  const { data: dataPaso4 } = useApiQuery({
    queryKey: [
      'desgaste', 'wizard', 'paso4',
      bloque?.tipoAgrupacion,
      bloque?.agrupacionIds.join(','),
      bloque?.via,
    ],
    queryFn: () =>
      desgasteApi.wizard.obtenerOpciones({
        paso: 4,
        tipoAgrupacion: bloque.tipoAgrupacion,
        agrupacionIds: bloque.agrupacionIds,
        via: bloque.via,
      }),
    enabled: !!bloque && bloque.paso >= 4 && bloque.agrupacionIds.length > 0,
  });

  const { data: dataPaso6 } = useApiQuery({
    queryKey: ['desgaste', 'wizard', 'paso6'],
    queryFn: () => desgasteApi.wizard.obtenerOpciones({ paso: 6 }),
    enabled: !!bloque && bloque.paso >= 6,
  });

  const opcionesPaso2 = (dataPaso2?.opciones ?? []).map((o: { id: number | string; etiqueta: string }) => ({
    value: String(o.id),
    label: o.etiqueta,
  }));

  const opcionesPaso4 = (dataPaso4?.opciones ?? []).map((o: { id: number | string; etiqueta: string }) => ({
    value: String(o.id),
    label: o.etiqueta,
  }));

  const opcionesPaso6 = (dataPaso6?.opciones ?? []).map((o: { id: number | string; etiqueta: string }) => ({
    value: String(o.id),
    label: o.etiqueta,
  }));

  // Navegacion del bloque activo
  const puedeAvanzar = () => {
    if (!bloque) return false;
    switch (bloque.paso) {
      case 1: return true;
      case 2: return bloque.agrupacionIds.length > 0;
      case 3: return true;
      case 4: return bloque.elementoCodigos.length > 0;
      case 5: return bloque.puntosW.length > 0;
      case 6: return bloque.escenarioIds.length > 0;
      default: return false;
    }
  };

  const esUltimoPaso = bloque?.paso === STEPS.length;
  const esPrimerPaso = bloque?.paso === 1;

  const handleSiguiente = () => {
    if (!esUltimoPaso) actualizar('paso', bloque.paso + 1);
  };

  const handleAnterior = () => {
    if (!esPrimerPaso) actualizar('paso', bloque.paso - 1);
  };

  // Gestion de bloques
  const agregarBloque = () => {
    const nuevo = crearBloquePorDefecto();
    setBloques((prev) => [...prev, nuevo]);
    setBloqueActivo(bloques.length);
  };

  const eliminarBloque = (idx: number) => {
    if (bloques.length === 1) return;
    setBloques((prev) => prev.filter((_, i) => i !== idx));
    setBloqueActivo((prev) => Math.min(prev, bloques.length - 2));
  };

  // Aplicar configuracion final
  const todosCompletos = bloques.every(
    (b) => b.paso === STEPS.length && b.escenarioIds.length > 0,
  );

  const handleAplicar = () => {
    const request: Grafico3DesgasteRequest = {
      configuraciones: bloques.map((b) => ({
        tipoAgrupacion: b.tipoAgrupacion,
        ...(b.tipoAgrupacion === 'TRAMO'            && { tramoIds:           b.agrupacionIds }),
        ...(b.tipoAgrupacion === 'CURVA_HORIZONTAL' && { curvaHorizontalIds: b.agrupacionIds }),
        ...(b.tipoAgrupacion === 'CURVA_VERTICAL'   && { curvaVerticalIds:   b.agrupacionIds }),
        via:             b.via,
        elementoCodigos: b.elementoCodigos,
        puntosW:         b.puntosW as any,
        escenarioIds:    b.escenarioIds,
      })),
    };
    onConfigurar(request);
  };

  // Resumen del bloque activo
  const agrupacionLabel = bloque?.agrupacionIds.length > 0
    ? bloque.agrupacionIds.length === 1
      ? opcionesPaso2.find((o: { value: string; label: string }) => o.value === String(bloque.agrupacionIds[0]))?.label
      : `${bloque.agrupacionIds.length} seleccionados`
    : undefined;

  const escenariosLabel = bloque?.escenarioIds.length > 0
    ? bloque.escenarioIds.length === 1
      ? opcionesPaso6.find((o: { value: string; label: string }) => o.value === String(bloque.escenarioIds[0]))?.label
      : `${bloque.escenarioIds.length} escenarios`
    : undefined;

  const summaryItems: WizardSummaryItem[] = !bloque ? [] : [
    {
      label: 'Agrupacion',
      value: TIPO_LABEL[bloque.tipoAgrupacion],
      tone: 'completed',
    },
    {
      label: 'Seleccion',
      value: agrupacionLabel,
      tone: agrupacionLabel ? 'completed' : bloque.paso === 2 ? 'current' : 'pending',
    },
    {
      label: 'Via',
      value: VIA_LABEL[bloque.via],
      tone: bloque.paso >= 3 ? 'completed' : bloque.paso === 3 ? 'current' : 'pending',
    },
    {
      label: 'Elementos',
      value: bloque.elementoCodigos.length === 0
        ? undefined
        : bloque.elementoCodigos.length === opcionesPaso4.length && opcionesPaso4.length > 0
          ? 'Todos'
          : `${bloque.elementoCodigos.length} seleccionado${bloque.elementoCodigos.length === 1 ? '' : 's'}`,
      tone: bloque.elementoCodigos.length > 0 && bloque.paso >= 4 ? 'completed' : bloque.paso === 4 ? 'current' : 'pending',
    },
    {
      label: 'Puntos',
      value: bloque.puntosW.length > 0 ? bloque.puntosW.join(' - ') : undefined,
      tone: bloque.puntosW.length > 0 && bloque.paso >= 5 ? 'completed' : bloque.paso === 5 ? 'current' : 'pending',
    },
    {
      label: 'Escenario',
      value: escenariosLabel,
      tone: escenariosLabel ? 'completed' : bloque.paso === 6 ? 'current' : 'pending',
    },
  ];

  if (!bloque) return null;

  return (
    <div className="space-y-4">

      {/* Tabs de bloques */}
      <div className="flex items-center gap-2 flex-wrap">
        {bloques.map((b, idx) => (
          <div key={b._id} className="flex items-center gap-1">
            <button
              onClick={() => setBloqueActivo(idx)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                idx === bloqueActivo
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              Config {idx + 1}
              {b.paso === STEPS.length && b.escenarioIds.length > 0 && (
                <Check className="ml-1.5 inline h-3 w-3" strokeWidth={3} />
              )}
            </button>
            {bloques.length > 1 && (
              <button
                onClick={() => eliminarBloque(idx)}
                className="rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Eliminar configuracion"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={agregarBloque}
          className="flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-brand hover:text-brand transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar config
        </button>
      </div>

      {/* Panel del bloque activo */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3.5">
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Configuracion {bloqueActivo + 1}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Define los parametros de esta agrupacion paso a paso.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={esPrimerPaso} onClick={handleAnterior}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Anterior
            </Button>
            {!esUltimoPaso ? (
              <Button size="sm" onClick={handleSiguiente} disabled={!puedeAvanzar()}>
                Siguiente
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => actualizar('paso', 1)}>
                <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                Reconfigurar
              </Button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="px-5 py-4">
          <Stepper
            steps={STEPS}
            currentStep={bloque.paso}
            onStepClick={(idx) => actualizar('paso', idx + 1)}
            className="mb-8"
          />

          {/* Paso 1 - Tipo de agrupacion */}
          {bloque.paso === 1 && (
            <WizardStep
              stepNumber={1}
              totalSteps={STEPS.length}
              icon={Layers}
              title="Como queres agrupar?"
              description="Elige si la proyeccion sera sobre un tramo entero o una curva especifica."
            >
              <FilterField label="Tipo de agrupacion">
                <Select
                  value={bloque.tipoAgrupacion}
                  onValueChange={(v) => actualizar('tipoAgrupacion', v as WizardG3Block['tipoAgrupacion'])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRAMO">Tramo</SelectItem>
                    <SelectItem value="CURVA_HORIZONTAL">Curva horizontal</SelectItem>
                    <SelectItem value="CURVA_VERTICAL">Curva vertical</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>
            </WizardStep>
          )}

          {/* Paso 2 - Seleccion de agrupacion */}
          {bloque.paso === 2 && (
            <WizardStep
              stepNumber={2}
              totalSteps={STEPS.length}
              icon={MapPin}
              title={`Selecciona ${TIPO_LABEL[bloque.tipoAgrupacion].toLowerCase()}(s)`}
              description="Podes elegir uno o varios para combinarlos en esta configuracion."
            >
              <FilterField label={TIPO_LABEL[bloque.tipoAgrupacion]}>
                <MultiSelect
                  options={opcionesPaso2}
                  selected={bloque.agrupacionIds.map(String)}
                  onChange={(values) => actualizar('agrupacionIds', values.map(Number))}
                  placeholder="Seleccionar..."
                  showAllOption
                  allOptionLabel={`Todos los ${TIPO_LABEL[bloque.tipoAgrupacion].toLowerCase()}s`}
                  itemLabelSingular={TIPO_LABEL[bloque.tipoAgrupacion].toLowerCase()}
                />
              </FilterField>
            </WizardStep>
          )}

          {/* Paso 3 - Via */}
          {bloque.paso === 3 && (
            <WizardStep
              stepNumber={3}
              totalSteps={STEPS.length}
              icon={Route}
              title="Que via analizar?"
              description="Filtra por tipo de via. Si eleges Ambas, se incluyen elementos de ambas direcciones."
            >
              <FilterField label="Via">
                <Select
                  value={bloque.via}
                  onValueChange={(v) => actualizar('via', v as WizardG3Block['via'])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMBAS">Ambas</SelectItem>
                    <SelectItem value="PAR">Par</SelectItem>
                    <SelectItem value="IMPAR">Impar</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>
            </WizardStep>
          )}

          {/* Paso 4 - Elementos */}
          {bloque.paso === 4 && (
            <WizardStep
              stepNumber={4}
              totalSteps={STEPS.length}
              icon={Target}
              title="Elementos especificos"
              description="Selecciona uno, varios o todos los elementos. Cada opcion muestra progresiva, via y lado del riel."
            >
              <FilterField label="Elementos">
                <MultiSelect
                  options={opcionesPaso4}
                  selected={bloque.elementoCodigos.map(String)}
                  onChange={(values) => actualizar('elementoCodigos', values.map(Number))}
                  placeholder="Seleccionar elementos..."
                  showAllOption
                  allOptionLabel="Todos los elementos"
                  itemLabelSingular="elemento"
                  searchPlaceholder="Buscar por codigo o progresiva..."
                />
              </FilterField>
            </WizardStep>
          )}

          {/* Paso 5 - Puntos W */}
          {bloque.paso === 5 && (
            <WizardStep
              stepNumber={5}
              totalSteps={STEPS.length}
              icon={Settings2}
              title="Puntos de medicion"
              description="Cada punto W genera una linea distinta por elemento. Selecciona uno o varios."
            >
              <FilterField label="Puntos">
                <MultiSelect
                  options={PUNTOS_W_OPTIONS}
                  selected={bloque.puntosW}
                  onChange={(values) => actualizar('puntosW', values as WizardG3Block['puntosW'])}
                  placeholder="Seleccionar puntos..."
                  showAllOption
                  allOptionLabel="Todos los puntos"
                />
              </FilterField>
            </WizardStep>
          )}

          {/* Paso 6 - Escenarios */}
          {bloque.paso === 6 && (
            <WizardStep
              stepNumber={6}
              totalSteps={STEPS.length}
              icon={Activity}
              title="Escenario(s) de proyeccion"
              description="Elige uno o varios escenarios MTB para comparar como varia el desgaste bajo distintas hipotesis de trafico."
            >
              <FilterField label="Escenarios">
                <MultiSelect
                  options={opcionesPaso6}
                  selected={bloque.escenarioIds.map(String)}
                  onChange={(values) => actualizar('escenarioIds', values.map(Number))}
                  placeholder="Seleccionar escenarios..."
                  itemLabelSingular="escenario"
                  searchPlaceholder="Buscar escenario..."
                />
              </FilterField>
            </WizardStep>
          )}

          <WizardSummary items={summaryItems} />
        </div>
      </div>

      {/* Boton Aplicar global */}
      <div className="flex justify-end">
        <Button onClick={handleAplicar} disabled={!todosCompletos} className="gap-1.5">
          <Check className="h-3.5 w-3.5" />
          Aplicar {bloques.length > 1 ? `(${bloques.length} configs)` : 'configuracion'}
        </Button>
      </div>

      {!todosCompletos && (
        <p className="text-center text-xs text-muted-foreground">
          Completa todos los pasos de cada configuracion para poder aplicar.
        </p>
      )}
    </div>
  );
}