/**
 * Selectores concretos para los 5 enums de Fase 2.D.
 *
 * Todos son wrappers minimalistas del componente genérico
 * SelectorEnumMultiple. Si más adelante se cambia el diseño
 * de cómo se ve el selector (ej: chips en vez de dropdown),
 * se modifica el genérico y los 5 wrappers heredan el cambio.
 *
 * NOTA: estos 5 selectores se pueden poner en un solo archivo
 * para mantener la carpeta filtros-comunes ordenada, o
 * separarlos en archivos individuales. Elegí UN ARCHIVO porque
 * cada componente es de ~12 líneas y todos comparten el mismo
 * patrón — separarlos sería sobrediseño.
 */

import { SelectorEnumMultiple } from './selector-enum-multiple';
import {
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  EstadoFalla,
  LABEL_TIPO_DEFECTO,
  LABEL_ELEMENTO_AFECTADO,
  LABEL_ZONA_AFECTADA,
  LABEL_PERFIL_FALLA,
  LABEL_ESTADO_FALLA,
} from '@/lib/types/enums/fallas.enum';

// ============================================================
// 1. Tipo de defecto
// ============================================================

interface SelectorTipoDefectoProps {
  value: TipoDefectoRiel[];
  onChange: (v: TipoDefectoRiel[]) => void;
}

export function SelectorTipoDefecto({ value, onChange }: SelectorTipoDefectoProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_TIPO_DEFECTO}
      placeholder="Seleccionar tipos de defecto..."
      itemLabelSingular="tipo de defecto"
      itemLabelPlural="tipos de defecto"
      helperVacio="Todos los tipos de defecto"
    />
  );
}

// ============================================================
// 2. Elemento afectado
// ============================================================

interface SelectorElementoAfectadoProps {
  value: ElementoAfectadoRiel[];
  onChange: (v: ElementoAfectadoRiel[]) => void;
}

export function SelectorElementoAfectado({
  value,
  onChange,
}: SelectorElementoAfectadoProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_ELEMENTO_AFECTADO}
      placeholder="Seleccionar elementos afectados..."
      itemLabelSingular="elemento"
      itemLabelPlural="elementos"
      helperVacio="Todos los elementos"
    />
  );
}

// ============================================================
// 3. Zona afectada
// ============================================================

interface SelectorZonaAfectadaProps {
  value: ZonaAfectadaRiel[];
  onChange: (v: ZonaAfectadaRiel[]) => void;
}

export function SelectorZonaAfectada({
  value,
  onChange,
}: SelectorZonaAfectadaProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_ZONA_AFECTADA}
      placeholder="Seleccionar zonas afectadas..."
      itemLabelSingular="zona"
      itemLabelPlural="zonas"
      helperVacio="Todas las zonas"
    />
  );
}

// ============================================================
// 4. Perfil
// ============================================================

interface SelectorPerfilProps {
  value: PerfilFallaRiel[];
  onChange: (v: PerfilFallaRiel[]) => void;
}

export function SelectorPerfil({ value, onChange }: SelectorPerfilProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_PERFIL_FALLA}
      placeholder="Seleccionar perfiles..."
      itemLabelSingular="perfil"
      itemLabelPlural="perfiles"
      helperVacio="Todos los perfiles"
    />
  );
}

// ============================================================
// 5. Estado actual
// ============================================================

interface SelectorEstadoActualProps {
  value: EstadoFalla[];
  onChange: (v: EstadoFalla[]) => void;
}

export function SelectorEstadoActual({
  value,
  onChange,
}: SelectorEstadoActualProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_ESTADO_FALLA}
      placeholder="Seleccionar estados..."
      itemLabelSingular="estado"
      itemLabelPlural="estados"
      helperVacio="Todos los estados"
    />
  );
}