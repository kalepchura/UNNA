// frontend/src/components/layout/sidebar.tsx

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/store/auth-context';
import { NAV_ITEMS, type NavItem } from './nav-items';
import { cn } from '@/lib/utils';

import logo from '@/assets/logo.png';

interface SidebarProps {
  onClose?: () => void;
}

/**
 * Sidebar principal — diseño industrial oscuro con acento brand.
 *
 * Estados:
 * - Default: texto suave gris, sin fondo.
 * - Hover: bg sidebar-accent + texto blanco.
 * - Active: bg sidebar-accent + borde brand a la izquierda + texto blanco.
 * - Expandable: chevron derecho que rota; children con guía vertical.
 */
export function Sidebar({ onClose }: SidebarProps) {
  const { esAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter((item) => !item.soloAdmin || esAdmin);

  async function handleLogout() {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  }

  return (
    <aside
      data-scope="sidebar"
      className="
        flex h-full w-[260px] flex-col
        border-r border-sidebar-border bg-sidebar text-sidebar-foreground
      "
    >
      {/* ────────────────────────────────────────────── LOGO ───── */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
        <img
          src={logo}
          alt="UNNA Transportes"
          className="max-h-10 w-auto object-contain"
        />
      </div>

      {/* ────────────────────────────────────────────── NAV ────── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-4">
        {items.map((item) =>
          item.children ? (
            <ItemConSubItems
              key={item.to}
              item={item}
              currentPath={location.pathname}
              onLinkClick={onClose}
            />
          ) : (
            <ItemSimple
              key={item.to}
              item={item}
              currentPath={location.pathname}
              onClick={onClose}
            />
          ),
        )}
      </nav>

      {/* ────────────────────────────────────────────── FOOTER ─── */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-4 w-4 text-sidebar-foreground/80" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight text-white">
              {user?.nombre ?? 'Usuario'}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">
              {user?.email ?? ''}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-primary">
              {user?.rol ?? ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="
            mt-2 flex w-full items-center justify-center gap-2
            rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3 py-2
            text-[12px] font-medium text-sidebar-foreground transition-all

            hover:bg-sidebar-accent hover:text-white
            active:translate-y-px
          "
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ITEM SIMPLE
// ──────────────────────────────────────────────────────────────────────────────

function ItemSimple({
  item,
  currentPath,
  onClick,
}: {
  item: NavItem;
  currentPath: string;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const active = isPathActive(item.to, currentPath);

  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-md px-3 py-2',
        'text-[13px] font-medium transition-colors',
        active
          ? 'bg-sidebar-accent text-white'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white',
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute -left-2.5 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-sidebar-primary"
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ITEM CON SUBITEMS
// ──────────────────────────────────────────────────────────────────────────────

function ItemConSubItems({
  item,
  currentPath,
  onLinkClick,
}: {
  item: NavItem;
  currentPath: string;
  onLinkClick?: () => void;
}) {
  const Icon = item.icon;
  const seccionActiva = currentPath.startsWith(item.to);
  const [expandido, setExpandido] = useState(seccionActiva);

  useEffect(() => {
    if (seccionActiva) setExpandido(true);
  }, [seccionActiva]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpandido((prev) => !prev)}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-md px-3 py-2',
          'text-[13px] font-medium transition-colors',
          seccionActiva
            ? 'text-white'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white',
        )}
      >
        {seccionActiva && (
          <span
            aria-hidden="true"
            className="absolute -left-2.5 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-sidebar-primary"
          />
        )}
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {expandido ? (
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
        )}
      </button>

      {expandido && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            const childActive = isPathActive(child.to, currentPath);
            return (
              <Link
                key={child.to}
                to={child.to}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors',
                  childActive
                    ? 'bg-sidebar-accent text-white'
                    : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/40 hover:text-white',
                )}
              >
                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────────────────────────────────────────

function isPathActive(to: string, currentPath: string): boolean {
  if (to === '/') return currentPath === '/';
  return currentPath.startsWith(to);
}
