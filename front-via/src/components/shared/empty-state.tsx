// components/shared/empty-state.tsx
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  titulo?: string;
  subtitulo?: string;
  className?: string;
}

export function EmptyState({ 
  titulo = "No hay datos", 
  subtitulo = "No se encontraron registros para mostrar",
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
        <Inbox className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {titulo}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {subtitulo}
      </p>
    </div>
  );
}