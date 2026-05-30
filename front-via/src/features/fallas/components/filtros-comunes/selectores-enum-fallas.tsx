/**
 * Selectores concretos para los enums de Fase 2.D, soldadura y Fase 3.
 *
 * Todos son wrappers minimalistas del componente genérico
 * SelectorEnumMultiple. Si más adelante se cambia el diseño
 * de cómo se ve el selector (ej: chips en vez de dropdown),
 * se modifica el genérico y los wrappers heredan el cambio.
 *
 * Selectores RIEL (Fase 2.D):
 *  - SelectorTipoDefecto
 *  - SelectorElementoAfectado
 *  - SelectorZonaAfectada
 *  - SelectorPerfil
 *  - SelectorEstadoActual
 *
 * Selectores SOLDADURA (Refinamiento):
 *  - SelectorAccionSoldadura
 *  - SelectorUbicacionFalla
 *
 * Selectores RIEL (Fase 3 — Listado completo):
 *  - SelectorAltaBaja      ← NUEVO
 *  - SelectorAccionRiel    ← NUEVO (NO confundir con SelectorAccionSoldadura)
 */

import { SelectorEnumMultiple } from './selector-enum-multiple';
import {
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  EstadoFalla,
  AccionFalla,
  UbicacionFalla,
  AltaBaja,
  AccionRiel,
  LABEL_TIPO_DEFECTO,
  LABEL_ELEMENTO_AFECTADO,
  LABEL_ZONA_AFECTADA,
  LABEL_PERFIL_FALLA,
  LABEL_ESTADO_FALLA,
  LABEL_ALTA_BAJA,
  LABEL_ACCION_RIEL,
} from '@/lib/types/enums/fallas.enum';

// ============================================================
// 1. Tipo de defecto (RIEL)
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
// 2. Elemento afectado (RIEL)
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
// 3. Zona afectada (RIEL)
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
// 4. Perfil (RIEL)
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
// 5. Estado actual (RIEL)
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

// ============================================================
// 6. Acción de soldadura (SOLDADURA)
// ============================================================
// Diccionario local porque LABEL_ACCION_SOLDADURA no existe en fallas.enum.ts.
// Es chico (3 valores) y no se reusa, así que va inline.

const LABEL_ACCION_SOLDADURA: Record<AccionFalla, string> = {
  [AccionFalla.CONSOLIDADO]: 'Consolidado',
  [AccionFalla.POR_DEFINIR]: 'Por definir',
  [AccionFalla.SUSTITUIDO]: 'Sustituido',
};

interface SelectorAccionSoldaduraProps {
  value: AccionFalla[];
  onChange: (v: AccionFalla[]) => void;
}

export function SelectorAccionSoldadura({
  value,
  onChange,
}: SelectorAccionSoldaduraProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_ACCION_SOLDADURA}
      placeholder="Seleccionar acciones de soldadura..."
      itemLabelSingular="acción"
      itemLabelPlural="acciones"
      helperVacio="Todas las acciones de soldadura"
    />
  );
}

// ============================================================
// 7. Ubicación falla soldadura (SOLDADURA)
// ============================================================

const LABEL_UBICACION_FALLA: Record<UbicacionFalla, string> = {
  [UbicacionFalla.ALMA]: 'Alma',
  [UbicacionFalla.PATIN]: 'Patín',
  [UbicacionFalla.HONGO]: 'Hongo',
  [UbicacionFalla.RIEL]: 'Riel',
};

interface SelectorUbicacionFallaProps {
  value: UbicacionFalla[];
  onChange: (v: UbicacionFalla[]) => void;
}

export function SelectorUbicacionFalla({
  value,
  onChange,
}: SelectorUbicacionFallaProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_UBICACION_FALLA}
      placeholder="Seleccionar ubicaciones..."
      itemLabelSingular="ubicación"
      itemLabelPlural="ubicaciones"
      helperVacio="Todas las ubicaciones de soldadura"
    />
  );
}

// ============================================================
// 8. Alta/Baja (RIEL) — FASE 3
// ============================================================
// Indica si la falla está en el riel ALTO o BAJO de una curva,
// o NO_APLICA en tangentes.

interface SelectorAltaBajaProps {
  value: AltaBaja[];
  onChange: (v: AltaBaja[]) => void;
}

export function SelectorAltaBaja({ value, onChange }: SelectorAltaBajaProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_ALTA_BAJA}
      placeholder="Seleccionar Alta/Baja..."
      itemLabelSingular="opción"
      itemLabelPlural="opciones"
      helperVacio="Todas (Alta + Baja + No aplica)"
    />
  );
}

// ============================================================
// 9. Acción actual del riel (RIEL) — FASE 3
// ============================================================
// ⚠️ NO confundir con SelectorAccionSoldadura.
//
// AccionRiel  = tipo de intervención sobre falla riel
//   (ESMERILADO, REEMPLAZO, RECARGA_RIEL, MONITOREO, etc.)
//
// AccionFalla = estado/acción tomada sobre falla soldadura
//   (CONSOLIDADO, POR_DEFINIR, SUSTITUIDO)
//
// Son dominios distintos del negocio. Coexisten porque vía corrida
// y soldadura inox tienen flujos de mantenimiento diferentes.

interface SelectorAccionRielProps {
  value: AccionRiel[];
  onChange: (v: AccionRiel[]) => void;
}

export function SelectorAccionRiel({
  value,
  onChange,
}: SelectorAccionRielProps) {
  return (
    <SelectorEnumMultiple
      value={value}
      onChange={onChange}
      labels={LABEL_ACCION_RIEL}
      placeholder="Seleccionar acciones de riel..."
      itemLabelSingular="acción"
      itemLabelPlural="acciones"
      helperVacio="Todas las acciones"
    />
  );
}