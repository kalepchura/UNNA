import { useState, useMemo, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { desgasteApi } from '@/lib/api/desgaste.api';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import type { ValorMtbDto } from '../types/valores-mtb.types';

const ANO_ACTUAL = new Date().getFullYear();

// ✅ memo + useCallback — no se re-renderiza al cambiar otros años
const MtbInput = memo(function MtbInput({
  anio,
  valorInicial,
  onCommit,
}: {
  anio: number;
  valorInicial: number | null;
  onCommit: (anio: number, val: number | null) => void;
}) {
  const [local, setLocal] = useState<string>(
    valorInicial !== null ? String(valorInicial) : '',
  );

  return (
    <Input
      type="number"
      step="0.001"
      min="0"
      value={local}
      onChange={(e) => {
        // ✅ Solo números y punto — bloquear letras y caracteres raros
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
          setLocal(val);
        }
      }}
      onKeyDown={(e) => {
        // Bloquear e, E, +, - que HTML number permite por defecto
        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
      }}
      onBlur={() => {
        const val = local === '' ? null : Number(local);
        onCommit(anio, val);
      }}
      className="w-36"
      placeholder="—"
    />
  );
});

// Fila con tipo extendido para manejar años sin dato
interface FilaMtb {
  id: number;
  anio: number;
  mtbOriginal: number | null;   // valor del backend
  mtbVisible: number | null;    // valor con cambios aplicados
  mtbAcumulado: number;         // calculado en tiempo real
}

export function ValoresMtbPage() {
  const { id } = useParams<{ id: string }>();
  const escenarioId = Number(id);
  const navigate = useNavigate();
  const invalidate = useInvalidate();

  const { data, isLoading } = useApiQuery({
    queryKey: ['desgaste', 'escenarios', escenarioId, 'valores'],
    queryFn: () => desgasteApi.escenarios.listarValores(escenarioId),
  });

  const [cambios, setCambios] = useState<Record<number, number | null>>({});

  // Años a mostrar: los que tienen dato en backend + años agregados manualmente
  const [aniosExtra, setAniosExtra] = useState<number[]>([]);

  const handleCommit = useCallback((anio: number, val: number | null) => {
    setCambios((prev) => ({ ...prev, [anio]: val }));
  }, []);

  const agregarAnio = () => {
    // Busca el siguiente año no presente
    const aniosExistentes = new Set([
      ...(data?.valores ?? []).map((v) => v.anio),
      ...aniosExtra,
    ]);
    let siguiente = ANO_ACTUAL;
    while (aniosExistentes.has(siguiente)) siguiente++;
    setAniosExtra((prev) => [...prev, siguiente]);
  };

  // ✅ Acumulado correcto: años sin dato no suman
  const filasMostradas = useMemo((): FilaMtb[] => {
    const mapaBackend = new Map<number, ValorMtbDto>();
    for (const v of data?.valores ?? []) {
      mapaBackend.set(v.anio, v);
    }

    // Unión de años: backend + extras, ordenados
    const todosAnios = [
      ...new Set([
        ...(data?.valores ?? []).map((v) => v.anio),
        ...aniosExtra,
      ]),
    ].sort((a, b) => a - b);

    let acumulado = 0;
    return todosAnios.map((anio) => {
      const backend = mapaBackend.get(anio);
      const mtbVisible =
        cambios[anio] !== undefined ? cambios[anio] : (backend?.mtb ?? null);

      // ✅ Solo suma si tiene valor real — años vacíos no afectan acumulado
      if (mtbVisible !== null) acumulado += mtbVisible;

      return {
        id: backend?.id ?? 0,
        anio,
        mtbOriginal: backend?.mtb ?? null,
        mtbVisible,
        mtbAcumulado: acumulado,
      };
    });
  }, [data?.valores, cambios, aniosExtra]);

  const guardarMut = useApiMutation({
    mutationFn: () => {
      const payload = Object.entries(cambios).map(([anio, mtb]) => ({
        anio: Number(anio),
        mtb,
      }));
      return desgasteApi.escenarios.guardarValores(escenarioId, { cambios: payload });
    },
    onSuccess: () => {
      invalidate(['desgaste', 'escenarios', escenarioId, 'valores']);
      setCambios({});
      setAniosExtra([]);
    },
    mensajeExito: 'Valores guardados correctamente',
  });

  const columns: ColumnDef<FilaMtb>[] = [
    {
      accessorKey: 'anio',
      header: 'Año',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.anio}</span>
      ),
    },
    {
      accessorKey: 'mtbVisible',
      header: 'MTB anual',
      cell: ({ row }) => (
        <MtbInput
          anio={row.original.anio}
          valorInicial={row.original.mtbVisible}
          onCommit={handleCommit}
        />
      ),
    },
    {
      accessorKey: 'mtbAcumulado',
      header: 'MTB acumulado',
      cell: ({ row }) => {
        const v = row.original.mtbAcumulado;
        return v > 0 ? (
          <span className="font-medium tabular-nums">{v.toFixed(3)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/desgaste/escenarios')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a escenarios
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Valores MTB: {data?.escenarioNombre ?? '...'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingrese el MTB anual. El acumulado se calcula solo con los años que tienen dato.
          </p>
        </div>
        {/* ✅ Botón para agregar año nuevo */}
        <Button variant="outline" onClick={agregarAnio}>
          <Plus className="mr-2 h-4 w-4" /> Agregar año
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filasMostradas}
        loading={isLoading}
        mensajeVacio="No hay valores. Use 'Agregar año' para comenzar."
      />

      {Object.keys(cambios).length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => guardarMut.mutate(undefined)}
            disabled={guardarMut.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {guardarMut.isPending
              ? 'Guardando...'
              : `Guardar ${Object.keys(cambios).length} cambios`}
          </Button>
        </div>
      )}
    </div>
  );
}