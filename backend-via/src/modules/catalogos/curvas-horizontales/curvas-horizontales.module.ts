import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurvaHorizontal } from './entities/curva-horizontal.entity';
import { CurvasHorizontalesRepository } from './repositories/curvas-horizontales.repository';
import { CurvasHorizontalesService } from './services/curvas-horizontales.service';
import { CurvasHorizontalesController } from './controllers/curvas-horizontales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CurvaHorizontal])],
  controllers: [CurvasHorizontalesController],
  providers: [CurvasHorizontalesService, CurvasHorizontalesRepository],
  exports: [CurvasHorizontalesService, CurvasHorizontalesRepository,],
})
export class CurvasHorizontalesModule {}