import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Velocidad } from './entities/velocidad.entity';
import { VelocidadesRepository } from './repositories/velocidades.repository';
import { VelocidadesService } from './services/velocidades.service';
import { VelocidadesController } from './controllers/velocidades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Velocidad])],
  controllers: [VelocidadesController],
  providers: [VelocidadesService, VelocidadesRepository],
  exports: [VelocidadesService],
})
export class VelocidadesModule {}