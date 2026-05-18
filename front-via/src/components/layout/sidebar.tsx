// frontend/src/components/layout/sidebar.tsx

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

import { toast } from 'sonner';

import { useAuth } from '@/store/auth-context';
import { NAV_ITEMS, type NavItem } from './nav-items';
import { cn } from '@/lib/utils';

import logo from '@/assets/logo.png';

interface SidebarProps {
  onClose?: () => void;
}

/**
 * Sidebar principal del sistema.
 *
 * Diseño:
 * - Corporativo
 * - Limpio
 * - Técnico
 * - Preparado para dashboards y gráficos
 */
export function Sidebar({ onClose }: SidebarProps) {
  const { esAdmin, user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // Filtrar según rol
  const items = NAV_ITEMS.filter(
    (item) => !item.soloAdmin || esAdmin,
  );

  async function handleLogout() {
    await logout();

    toast.success('Sesión cerrada');

    navigate('/login');
  }

  return (
    <aside
      className="
        flex
        h-full
        w-72
        flex-col
        border-r
        border-slate-200
        bg-slate-900
        text-slate-200
      "
    >

      {/* =======================================================
          LOGO
      ======================================================= */}
      <div
        className="
          flex
          h-20
          items-center
          justify-center
          border-b
          border-white/10
          px-6
        "
      >
        <img
          src={logo}
          alt="Logo"
          className="
            max-h-12
            w-auto
            object-contain
          "
        />
      </div>

      {/* =======================================================
          NAVEGACIÓN
      ======================================================= */}
      <nav
        className="
          flex-1
          overflow-y-auto
          px-3
          py-4
          space-y-1
        "
      >

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

      {/* =======================================================
          FOOTER USUARIO
      ======================================================= */}
      <div
        className="
          border-t
          border-white/10
          p-4
        "
      >

        {/* Usuario */}
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white/10
            "
          >
            <User className="h-5 w-5 text-slate-300" />
          </div>

          <div className="min-w-0 flex-1">

            <p
              className="
                truncate
                text-[13px]
                font-medium
                text-white
              "
            >
              {user?.nombre ?? 'Usuario'}
            </p>

            <p
              className="
                truncate
                text-[11px]
                text-slate-400
              "
            >
              {user?.email ?? ''}
            </p>

            <p
              className="
                mt-0.5
                text-[10px]
                uppercase
                tracking-wide
                text-cyan-400
              "
            >
              {user?.rol ?? ''}
            </p>

          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            mt-4
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-md
            border
            border-white/10
            bg-white/5
            px-3
            py-2.5
            text-[12px]
            font-medium
            text-slate-200
            transition-colors

            hover:bg-white/10
            hover:text-white
          "
        >
          <LogOut className="h-4 w-4" />

          Cerrar sesión
        </button>

      </div>
    </aside>
  );
}

// ============================================================
// ITEM SIMPLE
// ============================================================

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
        `
          group
          flex
          items-center
          gap-3
          border-l-2
          px-4
          py-2.5
          text-[13px]
          transition-all
        `,
        active
          ? `
              border-cyan-400
              bg-white/10
              text-white
            `
          : `
              border-transparent
              text-slate-300
              hover:bg-white/5
              hover:text-white
            `,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />

      <span>{item.label}</span>
    </Link>
  );
}

// ============================================================
// ITEM CON SUBITEMS
// ============================================================

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
    if (seccionActiva) {
      setExpandido(true);
    }
  }, [seccionActiva]);

  return (
    <div>

      {/* PADRE */}
      <button
        type="button"
        onClick={() => setExpandido((prev) => !prev)}
        className={cn(
          `
            flex
            w-full
            items-center
            gap-3
            border-l-2
            px-4
            py-2.5
            text-[13px]
            transition-all
          `,
          seccionActiva
            ? `
                border-cyan-400
                bg-white/5
                text-white
              `
            : `
                border-transparent
                text-slate-300
                hover:bg-white/5
                hover:text-white
              `,
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />

        <span className="flex-1 text-left">
          {item.label}
        </span>

        {expandido ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* CHILDREN */}
      {expandido && (
        <div
          className="
            ml-5
            mt-1
            space-y-1
            border-l
            border-white/10
            pl-3
          "
        >

          {item.children!.map((child) => {
            const ChildIcon = child.icon;

            const childActive = isPathActive(
              child.to,
              currentPath,
            );

            return (
              <Link
                key={child.to}
                to={child.to}
                onClick={onLinkClick}
                className={cn(
                  `
                    flex
                    items-center
                    gap-3
                    rounded-sm
                    px-3
                    py-2
                    text-[12px]
                    transition-colors
                  `,
                  childActive
                    ? `
                        bg-white/10
                        text-white
                      `
                    : `
                        text-slate-400
                        hover:bg-white/5
                        hover:text-white
                      `,
                )}
              >
                <ChildIcon className="h-3.5 w-3.5 shrink-0" />

                <span>{child.label}</span>
              </Link>
            );
          })}

        </div>
      )}
    </div>
  );
}

// ============================================================
// HELPER
// ============================================================

function isPathActive(
  to: string,
  currentPath: string,
): boolean {
  if (to === '/') {
    return currentPath === '/';
  }

  return currentPath.startsWith(to);
}