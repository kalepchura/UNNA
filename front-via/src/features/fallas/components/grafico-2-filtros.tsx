// frontend/src/features/fallas/components/grafico-2-filtros.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  CategoriaG2,
  LABEL_CATEGORIA_G2,
} from '@/lib/types/enums/fallas.enum';
import {
  ModoG2,
  LABEL_MODO_G2,
} from '@/lib/types/enums/fallas-graficos.enum';
import type { Grafico2Filtros } from '../types/grafico-2.types';

interface FiltrosProps {
  config: Grafico2Filtros;
  onChange: (config: Grafico2Filtros) => void;
  onAplicar: () => void;
  isLoading?: boolean;
}

// ============================================================
// CATEGORÍAS AGRUPADAS (para el dropdown de categoría)
// ============================================================

const CATEGORIAS_COMPARTIDAS: CategoriaG2[] = [CategoriaG2.VIA];
const CATEGORIAS_SOLO_RIEL: CategoriaG2[] = [
  CategoriaG2.CARRIL,
  CategoriaG2.TIPO_DEFECTO,
  CategoriaG2.ELEMENTO_AFECTADO,
  CategoriaG2.ZONA_AFECTADA,
  CategoriaG2.PERFIL,
  CategoriaG2.ALTA_BAJA,
  CategoriaG2.ESTADO_ACTUAL,
  CategoriaG2.ACCION_ACTUAL_RIEL,
];
const CATEGORIAS_SOLO_SOLDADURA: CategoriaG2[] = [
  CategoriaG2.ACCION,
  CategoriaG2.UBICACION_FALLA,
];

// ============================================================
// VALIDACIÓN
// ============================================================

interface CampoError {
  campo: string;
  mensaje: string;
}

function validarConfig(config: Grafico2Filtros): CampoError[] {
  const errores: CampoError[] = [];

  if (!config.fechaDesde) {
    errores.push({ campo: 'fechaDesde', mensaje: 'Debes seleccionar la fecha desde.' });
  }
  if (!config.fechaHasta) {
    errores.push({ campo: 'fechaHasta', mensaje: 'Debes seleccionar la fecha hasta.' });
  }
  if (
    config.fechaDesde &&
    config.fechaHasta &&
    config.fechaDesde > config.fechaHasta
  ) {
    errores.push({
      campo: 'fechaHasta',
      mensaje: 'La fecha desde no puede ser mayor que la fecha hasta.',
    });
  }

  if (!config.categoria) {
    errores.push({ campo: 'categoria', mensaje: 'Debes seleccionar una categoría.' });
  }

  if (!config.nivel) {
    errores.push({ campo: 'nivel', mensaje: 'Debes seleccionar un nivel de análisis.' });
  }

  if (!config.elementoIds || config.elementoIds.length === 0) {
    errores.push({
      campo: 'elementoIds',
      mensaje: 'Debes seleccionar al menos un elemento del nivel.',
    });
  }

  return errores;
}

// ============================================================
// COMPONENTE
// ============================================================

export function FiltrosGrafico2({
  config,
  onChange,
  onAplicar,
  isLoading,
}: FiltrosProps) {
  const [intentoAplicar, setIntentoAplicar] = useState(false);

  const fechaDesde = config.fechaDesde ?? '';
  const fechaHasta = config.fechaHasta ?? '';
  const categoria  = config.categoria;
  const modo       = config.modo ?? ModoG2.CATEGORIA;

  const errores = validarConfig(config);
  const camposConError = new Set(errores.map((e) => e.campo));
  const tieneError = (campo: string) => intentoAplicar && camposConError.has(campo);

  const handleAplicar = () => {
    setIntentoAplicar(true);
    if (errores.length > 0) return;
    onAplicar();
  };

  // Al cambiar categoría, limpiamos cualquier acotador antiguo
  // que haya quedado de iteraciones previas.
  const handleCategoriaChange = (nuevaCategoria: CategoriaG2) => {
    onChange({
      ...config,
      categoria: nuevaCategoria,
      tipoDefectos: undefined,
      elementosAfectados: undefined,
      zonasAfectadas: undefined,
      perfiles: undefined,
      estadosActuales: undefined,
      acciones: undefined,
      ubicacionesFalla: undefined,
    });
  };

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
              <li key={`${e.campo}-${e.mensaje}`} className="text-sm text-red-600">
                {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── BLOQUE 1: Temporal + Categoría + Modo ──────────── */}
      <FiltersGrid columns={4}>
        <FilterField
          label="Fecha desde"
          error={tieneError('fechaDesde') ? 'Obligatorio' : undefined}
        >
          <DateInput
            value={fechaDesde}
            onChange={(e) => onChange({ ...config, fechaDesde: e.target.value })}
            className={tieneError('fechaDesde') ? 'border-red-500' : ''}
          />
        </FilterField>

        <FilterField
          label="Fecha hasta"
          error={tieneError('fechaHasta') ? 'Obligatorio' : undefined}
        >
          <DateInput
            value={fechaHasta}
            onChange={(e) => onChange({ ...config, fechaHasta: e.target.value })}
            className={tieneError('fechaHasta') ? 'border-red-500' : ''}
          />
        </FilterField>

        <FilterField
          label="Categoría"
          error={tieneError('categoria') ? 'Obligatorio' : undefined}
        >
          <Select
            value={categoria ?? ''}
            onValueChange={(v) => handleCategoriaChange(v as CategoriaG2)}
          >
            <SelectTrigger
              className={tieneError('categoria') ? 'border-red-500 ring-red-200' : ''}
            >
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs font-bold text-blue-700">📊 COMPARTIDAS</SelectLabel>
                {CATEGORIAS_COMPARTIDAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>{LABEL_CATEGORIA_G2[cat]}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-bold text-emerald-700 mt-2">🚆 SOLO RIEL</SelectLabel>
                {CATEGORIAS_SOLO_RIEL.map((cat) => (
                  <SelectItem key={cat} value={cat}>{LABEL_CATEGORIA_G2[cat]}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-bold text-amber-700 mt-2">🔧 SOLO SOLDADURA</SelectLabel>
                {CATEGORIAS_SOLO_SOLDADURA.map((cat) => (
                  <SelectItem key={cat} value={cat}>{LABEL_CATEGORIA_G2[cat]}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField
          label="Modo"
          helper={
            modo === ModoG2.CATEGORIA
              ? 'Eje X = opciones del enum'
              : 'Eje X = elementos, apilado por enum'
          }
        >
          <Select
            value={modo}
            onValueChange={(v) => onChange({ ...config, modo: v as ModoG2 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ModoG2.CATEGORIA}>{LABEL_MODO_G2.CATEGORIA}</SelectItem>
              <SelectItem value={ModoG2.ELEMENTO}>{LABEL_MODO_G2.ELEMENTO}</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FiltersGrid>

      {/* ── BLOQUE 2: Cascada ──────────────────────────────── */}
      <div className="mt-4">
        <SelectorCascada<Grafico2Filtros>
          config={config}
          onChange={onChange}
          errores={intentoAplicar ? camposConError : new Set()}
        />
      </div>
    </FiltersToolbar>
  );
}