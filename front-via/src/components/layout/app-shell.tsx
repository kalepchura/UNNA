import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar */}
      <Sidebar />

      {/* Workspace */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="min-h-full px-6 py-5">
          <Outlet />
        </div>
      </main>

    </div>
  );
}