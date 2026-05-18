import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PagePlaceholderProps {
  titulo: string;
  descripcion?: string;
}

/**
 * Placeholder para páginas que aún no están implementadas.
 * Se irá reemplazando por las páginas reales en sub-fases siguientes.
 */
export function PagePlaceholder({ titulo, descripcion }: PagePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="h-5 w-5 text-muted-foreground" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {descripcion ?? 'Esta sección está en construcción. Se implementará en sub-fases siguientes.'}
        </p>
      </CardContent>
    </Card>
  );
}