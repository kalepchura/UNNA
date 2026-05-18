import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { AdminRoute } from './admin-route';
import { AppShell } from '@/components/layout/app-shell';

import { LoginPage } from '@/features/auth/login-page';
import { CatalogosPage } from '@/features/catalogos/catalogos-page';

// Fallas
import { FallasPage } from '@/features/fallas/fallas-page';
import { FallasRielPage } from '@/features/fallas/listado/fallas-riel-page';
import { FallasSoldaduraPage } from '@/features/fallas/listado/fallas-soldadura-page';
import { FallaRielDetallePage } from '@/features/fallas/detalle/falla-riel-detalle-page';
import { FallaSoldaduraDetallePage } from '@/features/fallas/detalle/falla-soldadura-detalle-page';
import { FallaRielFormPage } from '@/features/fallas/formulario/falla-riel-form-page';
import { FallaSoldaduraFormPage } from '@/features/fallas/formulario/falla-soldadura-form-page';

// Temperatura
import { TemperaturaPage } from '@/features/temperatura/temperatura-page';
import { ImportacionesPage } from '@/features/temperatura/importaciones/importaciones-page';
import { DetalleImportacionPage } from '@/features/temperatura/importaciones/detalle-importacion';

// Desgaste
import { DesgastePage } from '@/features/desgaste/desgaste-page';
import { EscenariosPage } from '@/features/desgaste/escenarios/escenarios-page';
import { ValoresMtbPage } from '@/features/desgaste/escenarios/valores-mtb-page';
import { MedicionesPage } from '@/features/desgaste/mediciones/mediciones-page';

// Otros
import { MapaCalorPage } from '@/features/mapa-calor/mapa-calor-page';
import { AuditoriaPage } from '@/features/auditoria/auditoria-page';
import { UsuariosPage } from '@/features/usuarios/usuarios-page';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>

          <Route path="/" element={<MapaCalorPage />} />
          <Route path="/catalogos" element={<CatalogosPage />} />
          <Route path="/mapa-calor" element={<MapaCalorPage />} />

          {/* Fallas */}
          <Route path="/fallas" element={<Navigate to="/fallas/analisis" replace />} />
          <Route path="/fallas/analisis" element={<FallasPage />} />
          <Route path="/fallas/riel" element={<FallasRielPage />} />
          <Route path="/fallas/riel/nueva" element={<FallaRielFormPage />} />
          <Route path="/fallas/riel/:id" element={<FallaRielDetallePage />} />
          <Route path="/fallas/riel/:id/editar" element={<FallaRielFormPage />} />
          <Route path="/fallas/soldadura" element={<FallasSoldaduraPage />} />
          <Route path="/fallas/soldadura/nueva" element={<FallaSoldaduraFormPage />} />
          <Route path="/fallas/soldadura/:id" element={<FallaSoldaduraDetallePage />} />
          <Route path="/fallas/soldadura/:id/editar" element={<FallaSoldaduraFormPage />} />

          {/* Temperatura */}
          <Route path="/temperatura" element={<Navigate to="/temperatura/analisis" replace />} />
          <Route path="/temperatura/analisis" element={<TemperaturaPage />} />
          <Route path="/temperatura/importaciones" element={<ImportacionesPage />} />
          <Route path="/temperatura/importaciones/:id" element={<DetalleImportacionPage />} />

          {/* Desgaste */}
          <Route path="/desgaste" element={<Navigate to="/desgaste/analisis" replace />} />
          <Route path="/desgaste/analisis" element={<DesgastePage />} />
          <Route path="/desgaste/escenarios" element={<EscenariosPage />} />
          <Route path="/desgaste/escenarios/:id/valores" element={<ValoresMtbPage />} />
          <Route path="/desgaste/mediciones" element={<MedicionesPage />} />

          {/* Solo admin */}
          <Route element={<AdminRoute />}>
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}