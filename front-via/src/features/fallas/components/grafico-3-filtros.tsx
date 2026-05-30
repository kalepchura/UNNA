// frontend/src/features/fallas/components/grafico-3-filtros.tsx

import { useState } from 'react';

import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  FiltersToolbar,
  FiltersGrid,
  FilterField,
  DateInput,
} from '@/components/shared/filters-toolbar';

import { SelectorCascada } from './filtros-comunes/selector-cascada';

import { TipoFallaFiltro } from '@/lib/types/enums/fallas.enum';

import type { Grafico3Filtros } from '../types/grafico-3.types';

interface FiltrosProps {
  config: Grafico3Filtros;
  onChange: (config: Grafico3Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Validaciones
// ─────────────────────────────────────────────────────────────

interface CampoError {
  campo: string;
  mensaje: string;
}

function validarConfig(config: Grafico3Filtros): CampoError[] {
  const errores: CampoError[] = [];

  if (!config.fechaDesde) {
    errores.push({
      campo: 'fechaDesde',
      mensaje: 'Debes seleccionar la fecha inicial.',
    });
  }

  if (!config.fechaHasta) {
    errores.push({
      campo: 'fechaHasta',
      mensaje: 'Debes seleccionar la fecha final.',
    });
  }

  if (
    config.fechaDesde &&
    config.fechaHasta &&
    config.fechaDesde > config.fechaHasta
  ) {
    errores.push({
      campo: 'rangoFechas',
      mensaje: 'La fecha inicial no puede ser mayor que la fecha final.',
    });
  }

  if (!config.nivel) {
    errores.push({
      campo: 'nivel',
      mensaje: 'Debes seleccionar un nivel de análisis.',
    });
  }

  if (!config.elementoIds || config.elementoIds.length === 0) {
    errores.push({
      campo: 'elementoIds',
      mensaje: 'Debes seleccionar al menos un elemento del nivel.',
    });
  }

  return errores;
}

export function FiltrosGrafico3({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  // ───────────────────────────────────────────────────────────
  // Estado de validación
  // ───────────────────────────────────────────────────────────

  const [intentoAplicar, setIntentoAplicar] = useState(false);

  const errores = validarConfig(config);

  const camposConError = new Set(
    errores.map((e) => e.campo),
  );

  const tieneError = (campo: string) =>
    intentoAplicar && camposConError.has(campo);

  // ───────────────────────────────────────────────────────────
  // Valores actuales
  // ───────────────────────────────────────────────────────────

  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';

  const apilarPorTipo = config.apilarPorTipo ?? false;

  const tipoFalla = config.tipoFalla;

  // apilarPorTipo solo tiene sentido si tipoFalla es AMBAS o no se eligió.
  const puedeApilar =
    !tipoFalla ||
    tipoFalla === TipoFallaFiltro.AMBAS;

  // ───────────────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────────────

  const handleAplicar = () => {
    setIntentoAplicar(true);

    if (errores.length > 0) {
      return;
    }

    onAplicar();
  };

  const handleChange = (nuevoConfig: Grafico3Filtros) => {
    onChange(nuevoConfig);
  };

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <FiltersToolbar
      title="Filtros del gráfico"
      variant="flush"
      primaryAction={
        <Button
          onClick={handleAplicar}
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? 'Cargando…' : 'Aplicar filtros'}
        </Button>
      }
    >
      {/* ── Banner de errores ───────────────────────────── */}
      {intentoAplicar && errores.length > 0 && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="mb-1 text-sm font-medium text-red-700">
            Completa la configuración antes de aplicar:
          </p>

          <ul className="list-inside list-disc space-y-0.5">
            {errores.map((e) => (
              <li
                key={e.campo}
                className="text-sm text-red-600"
              >
                {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── BLOQUE 1: Temporal + visualización ─────────── */}
      <FiltersGrid columns={4}>
        <FilterField
          label="Fecha desde"
          error={
            tieneError('fechaDesde')
              ? 'Obligatorio'
              : undefined
          }
        >
          <DateInput
            value={fechaDesde}
            className={
              tieneError('fechaDesde')
                ? 'border-red-500 ring-red-200'
                : ''
            }
            onChange={(e) =>
              handleChange({
                ...config,
                fechaDesde: e.target.value,
              })
            }
          />
        </FilterField>

        <FilterField
          label="Fecha hasta"
          error={
            tieneError('fechaHasta')
              ? 'Obligatorio'
              : undefined
          }
        >
          <DateInput
            value={fechaHasta}
            className={
              tieneError('fechaHasta')
                ? 'border-red-500 ring-red-200'
                : ''
            }
            onChange={(e) =>
              handleChange({
                ...config,
                fechaHasta: e.target.value,
              })
            }
          />
        </FilterField>

        <FilterField
          label="Visualización"
          helper={
            !puedeApilar
              ? 'Solo disponible cuando "Tipo de Falla" es "Ambas".'
              : undefined
          }
        >
          <Select
            value={apilarPorTipo ? 'SI' : 'NO'}
            disabled={!puedeApilar}
            onValueChange={(v) =>
              handleChange({
                ...config,
                apilarPorTipo: v === 'SI',
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="NO">
                Total combinado
              </SelectItem>

              <SelectItem value="SI">
                Apilar Riel + Soldadura
              </SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FiltersGrid>

      {/* ── BLOQUE 2: Cascada ──────────────────────────── */}
      <div className="mt-4">
        <SelectorCascada<Grafico3Filtros>
          config={config}
          onChange={handleChange}
          errores={
            intentoAplicar
              ? camposConError
              : new Set()
          }
        />
      </div>
    </FiltersToolbar>
  );
}