import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estacion } from './entities/estacion.entity';
import { EstacionesRepository } from './repositories/estaciones.repository';
import { EstacionesService } from './services/estaciones.service';
import { EstacionesController } from './controllers/estaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Estacion])],
  controllers: [EstacionesController],
  providers: [EstacionesService, EstacionesRepository],
  exports: [EstacionesService],
})
export class EstacionesModule {}