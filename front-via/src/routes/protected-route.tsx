import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth-context';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export function ProtectedRoute() {
  const { session, user, loading } = useAuth();
  const location = useLocation();

  // Carga inicial (restauración de sesión al recargar página)
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}