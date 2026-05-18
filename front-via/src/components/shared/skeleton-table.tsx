import { cn } from '@/lib/utils';

interface SkeletonTableProps {
  /** Número de columnas a mostrar */
  columnas: number;
  /** Número de filas (por defecto 5) */
  filas?: number;
  /** Clases adicionales para el contenedor */
  className?: string;
}

/**
 * Componente Skeleton para tablas en carga
 * Proporciona feedback visual mientras se cargan los datos
 */
export function SkeletonTable({ columnas, filas = 5, className }: SkeletonTableProps) {
  return (
    <div className={cn("tabla-wrapper overflow-x-auto", className)}>
      <table className="w-full border-collapse" aria-label="Cargando datos...">
        <tbody>
          {Array(filas)
            .fill(0)
            .map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {Array(columnas)
                  .fill(0)
                  .map((_, colIndex) => (
                    <td key={colIndex} className="p-2">
                      <div className="h-5 w-full max-w-[120px] bg-muted animate-pulse rounded" />
                     </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton específico para la tabla de fallas de riel (12 columnas)
 */
export function SkeletonFallasRiel() {
  return <SkeletonTable columnas={12} filas={5} />;
}

/**
 * Skeleton específico para la tabla de fallas de soldadura (11 columnas)
 */
export function SkeletonFallasSoldadura() {
  return <SkeletonTable columnas={11} filas={5} />;
}