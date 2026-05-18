// frontend/src/features/catalogos/catalogos-page.tsx

import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import {
  SectionTabs,
  SectionTabPanel,
  type SectionTabItem,
} from '@/components/shared/section-tabs';

import { TramosTab } from './tabs/tramos-tab';
import { EstacionesTab } from './tabs/estaciones-tab';
import { CurvasHorizontalesTab } from './tabs/curvas-horizontales-tab';
import { CurvasVerticalesTab } from './tabs/curvas-verticales-tab';
import { VelocidadesTab } from './tabs/velocidades-tab';
import { CambiaviasTab } from './tabs/cambiavias-tab';
import { ElementosDesgasteTab } from './tabs/elementos-desgaste-tab';

const TABS: SectionTabItem[] = [
  { value: 'tramos', label: 'Tramos' },
  { value: 'estaciones', label: 'Estaciones' },
  { value: 'curvas-h', label: 'Curvas Horizontales' },
  { value: 'curvas-v', label: 'Curvas Verticales' },
  { value: 'velocidades', label: 'Velocidades' },
  { value: 'cambiavias', label: 'Cambiavías' },
  { value: 'elementos', label: 'Elementos de Desgaste' },
];

export function CatalogosPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <PageHeader
        title="Catálogos Operacionales"
        subtitle="Gestión de infraestructura ferroviaria — Línea 1 Metro de Lima"
        breadcrumb={[
          { label: 'Operaciones' },
          { label: 'Catálogos' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo registro
            </Button>
          </>
        }
      />

      {/* TABS + CONTENIDO */}
      <SectionTabs items={TABS} defaultValue="tramos">
        <SectionTabPanel value="tramos">
          <TramosTab />
        </SectionTabPanel>
        <SectionTabPanel value="estaciones">
          <EstacionesTab />
        </SectionTabPanel>
        <SectionTabPanel value="curvas-h">
          <CurvasHorizontalesTab />
        </SectionTabPanel>
        <SectionTabPanel value="curvas-v">
          <CurvasVerticalesTab />
        </SectionTabPanel>
        <SectionTabPanel value="velocidades">
          <VelocidadesTab />
        </SectionTabPanel>
        <SectionTabPanel value="cambiavias">
          <CambiaviasTab />
        </SectionTabPanel>
        <SectionTabPanel value="elementos">
          <ElementosDesgasteTab />
        </SectionTabPanel>
      </SectionTabs>
    </div>
  );
}
