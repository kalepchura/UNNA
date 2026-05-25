import { useState, useMemo, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { desgasteApi } from '@/lib/api/desgaste.api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { PageHeader } from '@/components/layout/page-header';
import { DataCard } from '@/components/shared/data-card';
import { DataTable } from '@/components/tables/data-table';

import type { ValorMtbDto } from '../types/valores-mtb.types';

const ANIO_MIN = 2012;
const ANIO_ACTUAL = new Date().getFullYear();

/* =========================================
   INPUT MEMOIZADO
========================================= */
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
      placeholder="—"
      className="w-36 tabular-nums"
      onChange={(e) => {
        const val = e.target.value;

        if (val === '' || /^\d*\.?\d*$/.test(val)) {
          setLocal(val);
        }
      }}
      onKeyDown={(e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
          e.preventDefault();
        }
      }}
      onBlur={() => {
        onCommit(anio, local === '' ? null : Number(local));
      }}
    />
  );
});

/* =========================================
   TYPES
========================================= */
interface FilaMtb {
  id: number;
  anio: number;
  mtbVisible: number | null;
  mtbAcumulado: number | null;
  esFuturo: boolean;
}

/* =========================================
   PAGE
========================================= */
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
  const [aniosExtra, setAniosExtra] = useState<number[]>([]);

  /* =========================================
     AÑOS BASE
  ========================================= */
  const aniosBase = useMemo(() => {
    const lista: number[] = [];

    for (let a = ANIO_MIN; a <= ANIO_ACTUAL; a++) {
      lista.push(a);
    }

    return lista;
  }, []);

  /* =========================================
     HANDLE INPUT
  ========================================= */
  const handleCommit = useCallback(
    (anio: number, val: number | null) => {
      setCambios((prev) => ({
        ...prev,
        [anio]: val,
      }));
    },
    [],
  );

  /* =========================================
     AGREGAR AÑO FUTURO
  ========================================= */
  const agregarAnio = () => {
    const max = Math.max(
      ANIO_ACTUAL,
      ...(data?.valores ?? []).map((v) => v.anio),
      ...aniosExtra,
    );

    setAniosExtra((prev) => [...prev, max + 1]);
  };

  /* =========================================
     ELIMINAR AÑO FUTURO
     (soft delete = mtb null)
  ========================================= */
  const eliminarAnio = (anio: number) => {
    setCambios((prev) => ({
      ...prev,
      [anio]: null,
    }));

    setAniosExtra((prev) => prev.filter((a) => a !== anio));
  };

  /* =========================================
     FILAS
  ========================================= */
  const filasMostradas = useMemo((): FilaMtb[] => {
    const mapaBackend = new Map<number, ValorMtbDto>();

    for (const v of data?.valores ?? []) {
      mapaBackend.set(v.anio, v);
    }

    // años futuros guardados con valor
    const aniosFuturosBackend = (data?.valores ?? [])
      .filter(
        (v) =>
          v.anio > ANIO_ACTUAL &&
          v.mtb !== null,
      )
      .map((v) => v.anio);

    const todosAnios = [
      ...new Set([
        ...aniosBase,
        ...aniosFuturosBackend,
        ...aniosExtra,
      ]),
    ].sort((a, b) => a - b);

    // detectar último año con MTB
    const aniosConValor = todosAnios.filter((anio) => {
      const backend = mapaBackend.get(anio);

      const mtb =
        cambios[anio] !== undefined
          ? cambios[anio]
          : backend?.mtb ?? null;

      return mtb !== null;
    });

    const ultimoAnioConValor =
      aniosConValor.length > 0
        ? Math.max(...aniosConValor)
        : null;

    let acumulado = 0;

    return todosAnios.map((anio) => {
      const backend = mapaBackend.get(anio);

      const mtbVisible =
        cambios[anio] !== undefined
          ? cambios[anio]
          : backend?.mtb ?? null;

      if (mtbVisible !== null) {
        acumulado += mtbVisible;
      }

      return {
        id: backend?.id ?? 0,

        anio,

        mtbVisible,

        mtbAcumulado:
          ultimoAnioConValor !== null &&
          anio <= ultimoAnioConValor
            ? acumulado
            : null,

        esFuturo: anio > ANIO_ACTUAL,
      };
    });
  }, [data?.valores, cambios, aniosExtra, aniosBase]);

  /* =========================================
     GUARDAR
  ========================================= */
  const guardarMut = useApiMutation({
    mutationFn: () => {
      const payload = Object.entries(cambios).map(
        ([anio, mtb]) => ({
          anio: Number(anio),
          mtb,
        }),
      );

      return desgasteApi.escenarios.guardarValores(
        escenarioId,
        {
          cambios: payload,
        },
      );
    },

    onSuccess: () => {
      invalidate([
        'desgaste',
        'escenarios',
        escenarioId,
        'valores',
      ]);

      setCambios({});
      setAniosExtra([]);
    },

    mensajeExito: 'Valores guardados correctamente',
  });

  /* =========================================
     COLUMNS
  ========================================= */
  const columns: ColumnDef<FilaMtb>[] = [
    {
      accessorKey: 'anio',

      header: 'Año',

      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-medium tabular-nums">
          {row.original.anio}
        </span>
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

      header: () => (
        <span className="block text-right">
          MTB acumulado
        </span>
      ),

      cell: ({ row }) => {
        const v = row.original.mtbAcumulado;

        return v !== null ? (
          <span className="block text-right font-medium tabular-nums">
            {v.toFixed(3)}
          </span>
        ) : (
          <span className="block text-right text-muted-foreground">
            —
          </span>
        );
      },
    },

    {
      id: 'acciones',

      header: '',

      cell: ({ row }) =>
        row.original.esFuturo ? (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                eliminarAnio(row.original.anio)
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : null,
    },
  ];

  const hasCambios = Object.keys(cambios).length > 0;

  /* =========================================
     UI
  ========================================= */
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Valores MTB · ${
          data?.escenarioNombre ?? '…'
        }`}
        subtitle="Histórico fijo + proyección futura editable"
        breadcrumb={[
          { label: 'Desgaste' },
          { label: 'Escenarios' },
          { label: data?.escenarioNombre ?? '…' },
        ]}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate('/desgaste/escenarios')
              }
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Volver
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={agregarAnio}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Agregar año futuro
            </Button>

            {hasCambios && (
              <Button
                size="sm"
                disabled={guardarMut.isPending}
                onClick={() =>
                  guardarMut.mutate(undefined)
                }
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />

                {guardarMut.isPending
                  ? 'Guardando…'
                  : `Guardar ${
                      Object.keys(cambios).length
                    } cambio${
                      Object.keys(cambios).length === 1
                        ? ''
                        : 's'
                    }`}
              </Button>
            )}
          </>
        }
      />

      <DataCard>
        <DataTable
          bare
          columns={columns}
          data={filasMostradas}
          loading={isLoading}
          mensajeVacio="No hay valores."
        />
      </DataCard>
    </div>
  );
}