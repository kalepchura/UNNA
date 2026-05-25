// frontend/src/features/catalogos/catalogos-page.tsx

import {
  SectionTabs,
  SectionTabPanel,
  type SectionTabItem,
} from '@/components/shared/section-tabs';
import { PageHeader } from '@/components/layout/page-header';

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
      <PageHeader
        title="Catálogos Operacionales"
        subtitle="Gestión de infraestructura ferroviaria — Línea 1 Metro de Lima"
        breadcrumb={[
          { label: 'Operaciones' },
          { label: 'Catálogos' },
        ]}
      />

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