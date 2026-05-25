import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';

/**
 * AppShell — layout raíz autenticado.
 *
 * - Sidebar oscuro fijo a la izquierda.
 * - Workspace con scroll independiente, padding consistente y ancho máx.
 *   El padding inferior es generoso para que el último elemento no quede
 *   pegado al borde de la pantalla.
 */
export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Workspace */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto min-h-full w-full max-w-[1500px] px-6 pb-16 pt-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
