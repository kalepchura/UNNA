import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { EsquemaBaseService } from './services/esquema-base.service';
import { MapaTemperaturaService } from './services/mapa-temperatura.service';
import { MapaDesgasteService } from './services/mapa-desgaste.service';
import { MapaFallasService } from './services/mapa-fallas.service';

// Repository
import { MapaCalorRepository } from './repositories/mapa-calor.repository';

// Controllers
import { MapaCalorController } from './controllers/mapa-calor.controller';

// Entidades
import { Temperatura } from '../temperatura/entities/temperatura.entity';
import { MedicionDesgaste } from '../desgaste/entities/medicion-desgaste.entity';
import { ElementoDesgaste } from '../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';
import { FallaRiel } from '../fallas/entities/falla-riel.entity';
import { Tramo } from '../catalogos/tramos/entities/tramo.entity';
import { Cambiavia } from '../catalogos/cambiavias/entities/cambiavia.entity';
import { CurvaHorizontal } from '../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../catalogos/curvas-verticales/entities/curva-vertical.entity';

// Catálogos / módulos relacionados
import { TramosModule } from '../catalogos/tramos/tramos.module';
import { EstacionesModule } from '../catalogos/estaciones/estaciones.module';
import { DesgasteModule } from '../desgaste/desgaste.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Temperatura,
      MedicionDesgaste,
      ElementoDesgaste,
      FallaRiel,
      Tramo,
      Cambiavia,
      CurvaHorizontal,
      CurvaVertical,
    ]),
    TramosModule,
    EstacionesModule,
    forwardRef(() => DesgasteModule),
  ],
  controllers: [MapaCalorController],
  providers: [
    EsquemaBaseService,
    MapaTemperaturaService,
    MapaDesgasteService,
    MapaFallasService,
    MapaCalorRepository,
  ],
  exports: [
    EsquemaBaseService,
    MapaTemperaturaService,
    MapaDesgasteService,
    MapaFallasService,
  ],
})
export class MapaCalorModule {}