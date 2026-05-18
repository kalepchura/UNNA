// frontend/src/components/layout/page-header.tsx

import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  /** Título principal de la página (h1). */
  title: string;
  /** Subtítulo opcional (línea de contexto debajo del título). */
  subtitle?: string;
  /** Migajas de pan (breadcrumb) opcionales arriba del título. */
  breadcrumb?: BreadcrumbItem[];
  /** Acciones a la derecha (botones, dropdowns, etc.). */
  actions?: ReactNode;
  /** Clase adicional para el contenedor. */
  className?: string;
}

/**
 * Encabezado estándar reutilizable para CUALQUIER página del sistema.
 *
 * Uso típico:
 *   <PageHeader
 *     title="Catálogos Operacionales"
 *     subtitle="Gestión de infraestructura ferroviaria"
 *     breadcrumb={[{ label: 'Operaciones' }, { label: 'Catálogos' }]}
 *     actions={
 *       <>
 *         <Button variant="outline" size="sm"><Download/> Exportar</Button>
 *         <Button size="sm"><Plus/> Nuevo tramo</Button>
 *       </>
 *     }
 *   />
 *
 * Es el patrón canónico — úsalo en Fallas, Desgaste, Auditoría, Usuarios, etc.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            aria-label="breadcrumb"
            className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {breadcrumb.map((item, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      isLast && 'font-medium text-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                  {!isLast && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                  )}
                </span>
              );
            })}
          </nav>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
