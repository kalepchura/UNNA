import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { TramosTab } from './tabs/tramos-tab';
import { EstacionesTab } from './tabs/estaciones-tab';
import { CurvasHorizontalesTab } from './tabs/curvas-horizontales-tab';
import { CurvasVerticalesTab } from './tabs/curvas-verticales-tab';
import { VelocidadesTab } from './tabs/velocidades-tab';
import { CambiaviasTab } from './tabs/cambiavias-tab';
import { ElementosDesgasteTab } from './tabs/elementos-desgaste-tab';

const TABS = [
  { value: 'tramos', label: 'Tramos' },
  { value: 'estaciones', label: 'Estaciones' },
  { value: 'curvas-h', label: 'Curvas Horizontales' },
  { value: 'curvas-v', label: 'Curvas Verticales' },
  { value: 'velocidades', label: 'Velocidades' },
  { value: 'cambiavias', label: 'Cambiavías' },
  { value: 'elementos', label: 'Elementos de Desgaste' },
] as const;

export function CatalogosPage() {
  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Catálogos Operacionales
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Gestión de infraestructura ferroviaria
        </p>
      </div>

      {/* CONTENEDOR */}
      <div className="rounded-3xl border border-border/50 bg-background shadow-sm">

        <Tabs
          defaultValue="tramos"
          className="w-full"
        >

          {/* TABS */}
          <div className="border-b border-border/50 p-5">

            <TabsList className="bg-muted/40">

              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}

            </TabsList>
          </div>

          {/* CONTENIDO */}
          <div className="p-6">

            <TabsContent value="tramos">
              <TramosTab />
            </TabsContent>

            <TabsContent value="estaciones">
              <EstacionesTab />
            </TabsContent>

            <TabsContent value="curvas-h">
              <CurvasHorizontalesTab />
            </TabsContent>

            <TabsContent value="curvas-v">
              <CurvasVerticalesTab />
            </TabsContent>

            <TabsContent value="velocidades">
              <VelocidadesTab />
            </TabsContent>

            <TabsContent value="cambiavias">
              <CambiaviasTab />
            </TabsContent>

            <TabsContent value="elementos">
              <ElementosDesgasteTab />
            </TabsContent>

          </div>

        </Tabs>
      </div>
    </div>
  );
}