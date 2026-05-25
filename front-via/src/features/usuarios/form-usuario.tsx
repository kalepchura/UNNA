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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

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

  const crearMut = useApiMutation({
    mutationFn: (_params?: unknown) =>
      usuariosApi.crear({ nombre, correo, password, rol }),
    onSuccess,
  });

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
  const formId = 'form-usuario';

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" size="md">
        <SheetHeader>
          <SheetTitle>
            {usuario ? 'Editar usuario' : 'Nuevo usuario'}
          </SheetTitle>
          <SheetDescription>
            {usuario
              ? 'Modifique los datos del usuario.'
              : 'Complete los datos para registrar un nuevo usuario del sistema.'}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <form id={formId} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="usr-nombre">Nombre</Label>
              <Input
                id="usr-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Nombre completo"
              />
            </div>

            {!usuario && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="usr-correo">Correo</Label>
                  <Input
                    id="usr-correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    placeholder="usuario@unna.pe"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="usr-password">Contraseña</Label>
                  <Input
                    id="usr-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
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
              <p className="text-xs text-muted-foreground">
                {rol === 'ADMINISTRADOR'
                  ? 'Acceso completo, incluyendo auditoría y gestión de usuarios.'
                  : 'Acceso operativo: catálogos, fallas, desgaste y temperatura.'}
              </p>
            </div>
          </form>
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
