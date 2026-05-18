// frontend/src/components/shared/section-tabs.tsx

import { ReactNode } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface SectionTabItem {
  /** Identificador único de la pestaña (también el value de Tabs). */
  value: string;
  /** Etiqueta visible. */
  label: string;
  /** Contador opcional (ej: número de registros). */
  count?: number;
}

interface SectionTabsProps {
  /** Pestañas en orden de aparición. */
  items: SectionTabItem[];
  /** Pestaña seleccionada inicialmente. */
  defaultValue?: string;
  /** Pestaña controlada externamente (opcional). */
  value?: string;
  /** Callback de cambio. */
  onValueChange?: (v: string) => void;
  /** Contenido por pestaña: children debe ser un array de <SectionTabPanel/>. */
  children: ReactNode;
  /** Acciones opcionales a la derecha del tab nav (filtros globales, vista, etc.). */
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * Navegación de pestañas en estilo "pill" — una sola fila, scroll horizontal si no caben.
 *
 * Reemplaza el TabsList plano de shadcn cuando hay 4+ pestañas con etiquetas largas
 * (como los 7 sub-catálogos: Tramos, Estaciones, Curvas Horizontales, etc.).
 *
 * Uso:
 *   <SectionTabs
 *     items={[
 *       { value: 'tramos', label: 'Tramos', count: 14 },
 *       { value: 'estaciones', label: 'Estaciones', count: 22 },
 *     ]}
 *     defaultValue="tramos"
 *   >
 *     <SectionTabPanel value="tramos"><TramosTab /></SectionTabPanel>
 *     <SectionTabPanel value="estaciones"><EstacionesTab /></SectionTabPanel>
 *   </SectionTabs>
 */
export function SectionTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  children,
  rightSlot,
  className,
}: SectionTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      <div
        className="
          flex items-center justify-between gap-3
          rounded-xl border border-border bg-card p-1.5 shadow-sm
        "
      >
        <TabsList
          className="
            inline-flex h-auto flex-nowrap items-center gap-1
            overflow-x-auto bg-transparent p-0
            scrollbar-thin
          "
        >
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="
                group inline-flex shrink-0 items-center gap-2
                rounded-lg px-3.5 py-1.5
                text-[13px] font-medium text-muted-foreground
                transition-colors

                hover:bg-muted/60 hover:text-foreground

                data-[state=active]:bg-foreground
                data-[state=active]:text-background
                data-[state=active]:shadow-none
              "
            >
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span
                  className="
                    inline-flex min-w-[22px] items-center justify-center
                    rounded-full bg-muted px-1.5
                    text-[11px] font-semibold tabular-nums text-muted-foreground

                    group-data-[state=active]:bg-background/20
                    group-data-[state=active]:text-background
                  "
                >
                  {item.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {rightSlot && (
          <div className="flex flex-shrink-0 items-center gap-1.5 pr-1">
            {rightSlot}
          </div>
        )}
      </div>

      {children}
    </Tabs>
  );
}

interface SectionTabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

/**
 * Panel asociado a una pestaña. Equivalente a <TabsContent/> con margen superior.
 */
export function SectionTabPanel({ value, children, className }: SectionTabPanelProps) {
  return (
    <TabsContent
      value={value}
      className={cn('mt-4 focus-visible:outline-none', className)}
    >
      {children}
    </TabsContent>
  );
}
