import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { usuariosApi } from '@/lib/api/usuarios.api';
import type { Usuario } from './types/usuarios.types';

interface Props {
  usuario: Usuario | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FormUsuario({ usuario, onClose, onSuccess }: Props) {
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [correo, setCorreo] = useState(usuario?.correo ?? '');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'USUARIO' | 'ADMINISTRADOR'>(
    usuario?.rol ?? 'USUARIO',
  );

  // La mutación de creación no necesita argumentos (los datos vienen del estado del form)
  const crearMut = useApiMutation({
    mutationFn: (_params?: unknown) =>
      usuariosApi.crear({ nombre, correo, password, rol }),
    onSuccess,
  });

  // La mutación de actualización tampoco necesita argumentos
  const actualizarMut = useApiMutation({
    mutationFn: (_params?: unknown) =>
      usuariosApi.actualizar(usuario!.id, { nombre, rol }),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario) actualizarMut.mutate(undefined);
    else crearMut.mutate(undefined);
  };

  const isPending = crearMut.isPending || actualizarMut.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          {!usuario && (
            <>
              <div>
                <Label>Correo</Label>
                <Input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </>
          )}
          <div>
            <Label>Rol</Label>
            <Select value={rol} onValueChange={(v) => setRol(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USUARIO">Usuario</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}