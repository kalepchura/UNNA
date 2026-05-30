// frontend/src/features/fallas/components/grafico-1-filtros.tsx

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
} from '@/components/shared/filters-toolbar';
import { SelectorAnio } from './filtros-comunes/selector-anio';
import { SelectorCascada } from './filtros-comunes/selector-cascada';
import { GranularidadTemporal } from '@/lib/types/enums/fallas.enum';
import type { Grafico1Filtros } from '../types/grafico-1.types';

interface FiltrosProps {
  config: Grafico1Filtros;
  onChange: (config: Grafico1Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

// ── Qué campos son obligatorios y cómo los describimos ──────────
interface CampoError {
  campo: string;
  mensaje: string;
}

function validarConfig(config: Grafico1Filtros): CampoError[] {
  const errores: CampoError[] = [];

  if (!config.granularidad) {
    errores.push({ campo: 'granularidad', mensaje: 'Debes seleccionar una granularidad.' });
  }

  if (config.granularidad === GranularidadTemporal.MENSUAL && !config.anio) {
    errores.push({ campo: 'anio', mensaje: 'Debes seleccionar un año.' });
  }

  if (config.granularidad === GranularidadTemporal.ANUAL) {
    if (!config.anioInicio) {
      errores.push({ campo: 'anioInicio', mensaje: 'Debes seleccionar el año de inicio.' });
    }
    if (!config.anioFin) {
      errores.push({ campo: 'anioFin', mensaje: 'Debes seleccionar el año de fin.' });
    }
  }

  if (!config.nivel) {
    errores.push({ campo: 'nivel', mensaje: 'Debes seleccionar un nivel de análisis.' });
  }

  if (!config.elementoIds || config.elementoIds.length === 0) {
    errores.push({ campo: 'elementoIds', mensaje: 'Debes seleccionar al menos un elemento del nivel.' });
  }

  return errores;
}

export function FiltrosGrafico1({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  // Errores solo se muestran tras intentar aplicar por primera vez
  const [intentoAplicar, setIntentoAplicar] = useState(false);

  const granularidad = config.granularidad;
  const anio         = config.anio;
  const anioInicio   = config.anioInicio;
  const anioFin      = config.anioFin;

  const errores = validarConfig(config);
  const camposConError = new Set(errores.map((e) => e.campo));

  const handleAplicar = () => {
    setIntentoAplicar(true);
    if (errores.length > 0) return; // bloquea si hay errores
    onAplicar();
  };

  // Resetea el estado de "intentó aplicar" cuando el usuario cambia algo
  const handleChange = (nuevoConfig: Grafico1Filtros) => {
    onChange(nuevoConfig);
  };

  const tieneError = (campo: string) => intentoAplicar && camposConError.has(campo);

  return (
    <FiltersToolbar
      title="Filtros del gráfico"
      variant="flush"
      primaryAction={
        <Button onClick={handleAplicar} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando…' : 'Aplicar filtros'}
        </Button>
      }
    >
      {/* ── Banner de errores ──────────────────────────────── */}
      {intentoAplicar && errores.length > 0 && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm font-medium text-red-700 mb-1">
            Completa la configuración antes de aplicar:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {errores.map((e) => (
              <li key={e.campo} className="text-sm text-red-600">
                {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── BLOQUE 1: Temporal ─────────────────────────────── */}
      <FiltersGrid columns={4}>
        <FilterField
          label="Granularidad"
          error={tieneError('granularidad') ? 'Obligatorio' : undefined}
        >
          <Select
            value={granularidad ?? ''}
            onValueChange={(value: GranularidadTemporal) =>
              handleChange({
                ...config,
                granularidad: value,
                anio: value === GranularidadTemporal.MENSUAL ? config.anio : undefined,
                anioInicio: value === GranularidadTemporal.ANUAL ? config.anioInicio : undefined,
                anioFin: value === GranularidadTemporal.ANUAL ? config.anioFin : undefined,
              })
            }
          >
            <SelectTrigger
              className={tieneError('granularidad') ? 'border-red-500 ring-red-200' : ''}
            >
              <SelectValue placeholder="Selecciona granularidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GranularidadTemporal.MENSUAL}>Mensual</SelectItem>
              <SelectItem value={GranularidadTemporal.ANUAL}>Anual</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        {granularidad === GranularidadTemporal.MENSUAL && (
          <FilterField
            label="Año"
            error={tieneError('anio') ? 'Obligatorio' : undefined}
          >
            <SelectorAnio
              value={anio}
              onChange={(v) => handleChange({ ...config, anio: v })}
              hasError={tieneError('anio')}
            />
          </FilterField>
        )}

        {granularidad === GranularidadTemporal.ANUAL && (
          <>
            <FilterField
              label="Año Inicio"
              error={tieneError('anioInicio') ? 'Obligatorio' : undefined}
            >
              <SelectorAnio
                value={anioInicio}
                onChange={(v) => {
                  const nuevoFin =
                    anioFin !== undefined && v > anioFin ? v : anioFin;
                  handleChange({ ...config, anioInicio: v, anioFin: nuevoFin });
                }}
                hasError={tieneError('anioInicio')}
              />
            </FilterField>
            <FilterField
              label="Año Fin"
              error={tieneError('anioFin') ? 'Obligatorio' : undefined}
            >
              <SelectorAnio
                value={anioFin}
                onChange={(v) => handleChange({ ...config, anioFin: v })}
                minAnio={anioInicio}
                hasError={tieneError('anioFin')}
              />
            </FilterField>
          </>
        )}
      </FiltersGrid>

      {/* ── BLOQUE 2: Cascada ──────────────────────────────── */}
      <div className="mt-4">
        <SelectorCascada<Grafico1Filtros>
          config={config}
          onChange={handleChange}
          errores={intentoAplicar ? camposConError : new Set()}
        />
      </div>
    </FiltersToolbar>
  );
}