/**
 * Banner de confirmación post-creación.
 *
 * Aparece después de crear una falla (riel o soldadura) para indicar
 * éxito y ofrecer dos caminos al usuario:
 *  - Seguir adjuntando archivos/imágenes en la misma página
 *  - Ir directamente al detalle
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BannerCreadoProps {
  /** ID de la falla recién creada. Se muestra en el mensaje. */
  fallaId: number;
  /** Mensaje principal a mostrar. */
  mensaje: string;
  /** Ruta al detalle de la falla. Ej: "/fallas/riel/123" */
  rutaDetalle: string;
}

export function BannerCreado({
  fallaId,
  mensaje,
  rutaDetalle,
}: BannerCreadoProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-3 flex items-center justify-between gap-4">
      <p className="text-sm text-green-800 font-medium">
        ✓ {mensaje} (#{fallaId}). Puedes adjuntar archivos abajo o ir al detalle.
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate(rutaDetalle)}
      >
        Ir al detalle
      </Button>
    </div>
  );
}