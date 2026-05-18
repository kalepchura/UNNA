import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { FallaRiel } from './entities/falla-riel.entity';
import { FallaSoldaduraInox } from './entities/falla-soldadura-inox.entity';
import { ImagenFalla } from './entities/imagen-falla.entity';

// Repositorios
import { FallasRielRepository } from './repositories/fallas-riel.repository';
import { FallasSoldaduraInoxRepository } from './repositories/fallas-soldadura-inox.repository';
import { ImagenesFallaRepository } from './repositories/imagenes-falla.repository';
import { FallasAnalyticsRepository } from './repositories/fallas-analytics.repository';

// Services
import { FallasRielService } from './services/fallas-riel.service';
import { FallasSoldaduraInoxService } from './services/fallas-soldadura-inox.service';
import { ImagenesFallaService } from './services/imagenes-falla.service';
import { KpisFallasService } from './services/kpis-fallas.service';
import { Grafico1FallasService } from './services/grafico-1-fallas.service';
import { Grafico2FallasService } from './services/grafico-2-fallas.service';
import { Grafico3FallasService } from './services/grafico-3-fallas.service';

// Controllers
import { FallasRielController } from './controllers/fallas-riel.controller';
import { FallasSoldaduraInoxController } from './controllers/fallas-soldadura-inox.controller';
import { FallasAnalyticsController } from './controllers/fallas-analytics.controller';

// Catálogos
import { TramosModule } from '../catalogos/tramos/tramos.module';
import { CurvasHorizontalesModule } from '../catalogos/curvas-horizontales/curvas-horizontales.module';
import { CurvasVerticalesModule } from '../catalogos/curvas-verticales/curvas-verticales.module';
import { CambiaviasModule } from '../catalogos/cambiavias/cambiavias.module';
import { VelocidadesModule } from '../catalogos/velocidades/velocidades.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FallaRiel, FallaSoldaduraInox, ImagenFalla]),
    TramosModule,
    CurvasHorizontalesModule,
    CurvasVerticalesModule,
    CambiaviasModule,
    VelocidadesModule,
  ],
  controllers: [
    FallasRielController,
    FallasSoldaduraInoxController,
    FallasAnalyticsController,
  ],
  providers: [
    // CRUD
    FallasRielRepository,
    FallasRielService,
    FallasSoldaduraInoxRepository,
    FallasSoldaduraInoxService,
    ImagenesFallaRepository,
    ImagenesFallaService,

    // Analytics
    FallasAnalyticsRepository,
    KpisFallasService,
    Grafico1FallasService,
    Grafico2FallasService,
    Grafico3FallasService,
  ],
  exports: [
    FallasRielService,
    FallasSoldaduraInoxService,
    Grafico1FallasService,
    Grafico2FallasService,
    Grafico3FallasService,
  ],
})
export class FallasModule {}