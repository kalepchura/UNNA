import {
  Library,
  AlertTriangle,
  Thermometer,
  Wrench,
  Map,
  History,
  Users,
  BarChart3,
  Train,
  Flame,
  Upload,
  Database,
  Table,
  type LucideIcon,
} from 'lucide-react';

/**
 * Definición de un item de navegación del sidebar.
 *
 * - `soloAdmin: true` → solo visible para administradores.
 * - `children` → sub-items que se despliegan al hacer click en el padre.
 *   Si tiene `children`, el `to` se usa para indicar "estoy en esta sección"
 *   pero el click NO navega; navega cuando seleccionas un sub-item.
 */
export interface NavItem {
  /** URL del path (o prefijo si tiene children). */
  to: string;
  /** Etiqueta visible. */
  label: string;
  /** Icono de lucide-react. */
  icon: LucideIcon;
  /** Si solo se muestra a administradores. */
  soloAdmin?: boolean;
  /** Sub-items que se despliegan. Si está presente, el padre actúa como sección colapsable. */
  children?: NavItem[];
}

/**
 * Estructura del sidebar. Items en orden de aparición.
 *
 * Módulos como "Fallas" tienen sub-items (Análisis / Riel / Soldadura).
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/',            label: 'Mapa de Calor', icon: Map },
  { to: '/catalogos',   label: 'Catálogos',     icon: Library },

  // ----- Fallas con sub-items -----
  {
    to: '/fallas',
    label: 'Fallas',
    icon: AlertTriangle,
    children: [
      { to: '/fallas/analisis',  label: 'Análisis',              icon: BarChart3 },
      { to: '/fallas/riel',      label: 'Falla Riel',            icon: Train },
      { to: '/fallas/soldadura', label: 'Falla Soldadura Inox',  icon: Flame },
    ],
  },

  {
    to: '/temperatura',
    label: 'Temperatura',
    icon: Thermometer,
    children: [
      { to: '/temperatura/analisis',      label: 'Análisis',        icon: BarChart3 },
      { to: '/temperatura/importaciones', label: 'Importaciones',   icon: Upload },
    ],
  },
  {
    to: '/desgaste',
    label: 'Desgaste',
    icon: Wrench,
    children: [
      { to: '/desgaste/analisis',   label: 'Análisis',   icon: BarChart3 },
      { to: '/desgaste/escenarios', label: 'Escenarios', icon: Database },
      { to: '/desgaste/mediciones', label: 'Mediciones', icon: Table },
    ],
  },
  { to: '/auditoria',   label: 'Auditoría',     icon: History, soloAdmin: true },
  { to: '/usuarios',    label: 'Usuarios',      icon: Users,   soloAdmin: true },
];