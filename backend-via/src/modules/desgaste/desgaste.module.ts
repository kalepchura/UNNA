import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { MedicionDesgaste } from './entities/medicion-desgaste.entity';
import { EscenarioMTB } from './entities/escenario-mtb.entity';
import { MtbEscenario } from './entities/mtb-escenario.entity';
import { ElementoDesgaste } from '../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';
import { Tramo } from '../catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../catalogos/curvas-verticales/entities/curva-vertical.entity';

// Repositories
import { MedicionesDesgasteRepository } from './repositories/mediciones-desgaste.repository';
import { EscenariosMtbRepository } from './repositories/escenarios-mtb.repository';
import { MtbEscenarioRepository } from './repositories/mtb-escenario.repository';
import { DesgasteAnalyticsRepository } from './repositories/desgaste-analytics.repository';

// Services
import { MedicionesDesgasteService } from './services/mediciones-desgaste.service';
import { EscenariosMtbService } from './services/escenarios-mtb.service';
import { ValoresMtbService } from './services/valores-mtb.service';
import { KpisDesgasteService } from './services/kpis-desgaste.service';
import { WizardFiltrosService } from './services/wizard-filtros.service';

// Controllers
import { MedicionesDesgasteController } from './controllers/mediciones-desgaste.controller';
import { EscenariosMtbController } from './controllers/escenarios-mtb.controller';
import { DesgasteAnalyticsController } from './controllers/desgaste-analytics.controller';
import { GraficoG1Service } from './services/grafico-g1.service';
import { GraficoG2Service } from './services/grafico-g2.service';
import { GraficoG3Service } from './services/grafico-g3.service';

// Catálogos
import { TramosModule } from '../catalogos/tramos/tramos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicionDesgaste,
      EscenarioMTB,
      MtbEscenario,
      ElementoDesgaste,
      // Para el wizard:
      Tramo,
      CurvaHorizontal,
      CurvaVertical,
    ]),
    TramosModule,
  ],
  controllers: [
    MedicionesDesgasteController,
    EscenariosMtbController,
    DesgasteAnalyticsController,
  ],
  providers: [
    MedicionesDesgasteRepository,
    MedicionesDesgasteService,
    EscenariosMtbRepository,
    EscenariosMtbService,
    MtbEscenarioRepository,
    ValoresMtbService,
    DesgasteAnalyticsRepository,
    KpisDesgasteService,
    WizardFiltrosService,   
    GraficoG1Service,
    GraficoG2Service,
    GraficoG3Service,    
  ],
  exports: [
    MedicionesDesgasteService,
    EscenariosMtbService,
    ValoresMtbService,
    MtbEscenarioRepository,
    DesgasteAnalyticsRepository,
    EscenariosMtbRepository,
  ],
})
export class DesgasteModule {}