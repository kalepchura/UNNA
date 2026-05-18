import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurvaVertical } from './entities/curva-vertical.entity';
import { CurvasVerticalesRepository } from './repositories/curvas-verticales.repository';
import { CurvasVerticalesService } from './services/curvas-verticales.service';
import { CurvasVerticalesController } from './controllers/curvas-verticales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CurvaVertical])],
  controllers: [CurvasVerticalesController],
  providers: [CurvasVerticalesService, CurvasVerticalesRepository],
  exports: [CurvasVerticalesService, CurvasVerticalesRepository,],
})
export class CurvasVerticalesModule {}