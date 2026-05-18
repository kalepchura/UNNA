import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cambiavia } from './entities/cambiavia.entity';
import { CambiaviasRepository } from './repositories/cambiavias.repository';
import { CambiaviasService } from './services/cambiavias.service';
import { CambiaviasController } from './controllers/cambiavias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cambiavia])],
  controllers: [CambiaviasController],
  providers: [CambiaviasService, CambiaviasRepository],
  exports: [CambiaviasService],
})
export class CambiaviasModule {}