import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/auth-context';

/**
 * Wrapper de rutas que requieren rol ADMINISTRADOR.
 *
 * Asume que ya estamos dentro de ProtectedRoute (es decir, que
 * hay sesión y user). Si por alguna razón no, redirige a /.
 *
 * Si el usuario NO es admin → redirige a / (dashboard).
 */
export function AdminRoute() {
  const { user, esAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}