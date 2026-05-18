import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/store/auth-context';

interface HeaderProps {
  /** Llamado cuando el usuario hace click en el menú hamburguesa (solo mobile). */
  onMenuClick: () => void;
}

/**
 * Header superior de la aplicación.
 *
 * Mobile: muestra menú hamburguesa para abrir el sidebar
 * Desktop: solo muestra el dropdown del usuario a la derecha
 *
 * El dropdown incluye:
 *  - Email + nombre del usuario
 *  - Badge de rol
 *  - Cerrar sesión
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { user, esAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Lado izquierdo: botón hamburguesa (solo mobile) */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* Espacio reservado para breadcrumbs en el futuro si se quiere */}
      </div>

      {/* Lado derecho: usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{user?.nombre ?? '...'}</span>
              <Badge
                variant={esAdmin ? 'default' : 'secondary'}
                className="text-[10px] py-0 h-4"
              >
                {user?.rol ?? '...'}
              </Badge>
            </div>
            <div className="bg-muted rounded-full p-2">
              <User className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}