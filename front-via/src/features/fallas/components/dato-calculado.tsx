/**
 * Muestra un dato de solo lectura con su label.
 *
 * Usado en formularios para mostrar valores calculados o heredados
 * que el usuario NO puede editar (ej: tramo, velocidad, curvas).
 *
 * Si `indefinido` es true, el valor se muestra en cursiva y atenuado
 * para indicar que aún no se ha calculado o no aplica.
 */

interface DatoCalculadoProps {
  label: string;
  valor: string;
  indefinido?: boolean;
}

export function DatoCalculado({
  label,
  valor,
  indefinido = false,
}: DatoCalculadoProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`font-medium text-sm ${
          indefinido ? 'italic text-muted-foreground' : ''
        }`}
      >
        {valor}
      </p>
    </div>
  );
}