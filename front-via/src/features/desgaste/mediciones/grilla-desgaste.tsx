import { useRef, memo } from 'react';
import { Input } from '@/components/ui/input';
import type {
  GrillaResponse,
  FilaGrillaDto,
  CeldaModificadaDto,
} from '../types/mediciones.types';

const CeldaInput = memo(
  function CeldaInput({
    valor,
    placeholder,
    onCommit,
  }: {
    valor: number | null;
    placeholder: string;
    onCommit: (val: number | null) => void;
  }) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <Input
        ref={inputRef}
        type="number"
        step="0.01"
        min="-50"
        max="50"
        defaultValue={valor !== null ? String(valor) : ''}
        onBlur={() => {
          const raw = inputRef.current?.value ?? '';
          const val = raw === '' ? null : Number(raw);
          onCommit(val);
        }}
        className="w-16 h-6 text-xs px-1"
        placeholder={placeholder}
      />
    );
  },
  () => true,
);

interface Props {
  grilla: GrillaResponse;
  celdasModificadas: CeldaModificadaDto[];
  onCeldaChange: (celda: CeldaModificadaDto) => void;
}

export function GrillaDesgaste({
  grilla,
  celdasModificadas,
  onCeldaChange,
}: Props) {
  const { anios, filas } = grilla;

  const getValue = (
    fila: FilaGrillaDto,
    anio: number,
    trimestre: number,
    punto: string,
  ): number | null => {
    const mod = celdasModificadas.find(
      (c) =>
        c.elementoId === fila.elementoId &&
        c.anio === anio &&
        c.trimestre === trimestre &&
        c.punto === punto.toUpperCase(),
    );
    if (mod !== undefined) return mod.valor;
    return (
      fila.mediciones[anio]?.[trimestre]?.[
        punto as keyof (typeof fila.mediciones)[0][0]
      ] ?? null
    );
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 text-left">Elemento</th>
            <th className="px-2 py-1 text-left">Prog.</th>
            <th className="px-2 py-1 text-left">Vía / Riel</th>
            {anios.map((anio) => (
              <th
                key={anio}
                colSpan={4}
                className="px-2 py-1 text-center border-l"
              >
                {anio}
              </th>
            ))}
          </tr>
          <tr>
            <th />
            <th />
            <th />
            {anios.map((anio) =>
              [1, 2, 3, 4].map((trim) => (
                <th
                  key={`${anio}-${trim}`}
                  className="px-1 py-0.5 text-center border-l text-xs font-normal"
                >
                  T{trim}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filas.map((fila) => (
            <tr key={fila.elementoId} className="hover:bg-gray-50">
              <td className="px-2 py-1 font-medium">{fila.codigoElemento}</td>
              <td className="px-2 py-1">{fila.progresiva}</td>
              <td className="px-2 py-1">
                <div className="leading-tight">
                  <div>{fila.via}</div>
                  <div className="text-xs text-muted-foreground">{fila.riel}</div>
                </div>
              </td>
              {anios.map((anio) =>
                [1, 2, 3, 4].map((trimestre) => (
                  <td
                    key={`${anio}-${trimestre}`}
                    className="px-1 py-0.5 border-l"
                  >
                    <div className="flex flex-col gap-0.5">
                      {(['w1', 'w2', 'w3r', 'w3l'] as const).map((punto) => {
                        const valorResuelto = getValue(
                          fila,
                          anio,
                          trimestre,
                          punto,
                        );
                        return (
                          <CeldaInput
                            key={`${fila.elementoId}-${anio}-${trimestre}-${punto}-${valorResuelto ?? 'null'}`}
                            valor={valorResuelto}
                            placeholder={punto.toUpperCase()}
                            onCommit={(val) =>
                              onCeldaChange({
                                elementoId: fila.elementoId,
                                anio,
                                trimestre,
                                punto: punto.toUpperCase() as CeldaModificadaDto['punto'],
                                valor: val,
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </td>
                )),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}