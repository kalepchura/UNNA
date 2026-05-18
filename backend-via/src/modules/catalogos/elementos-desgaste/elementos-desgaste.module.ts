import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementoDesgaste } from './entities/elemento-desgaste.entity';
import { ElementosDesgasteRepository } from './repositories/elementos-desgaste.repository';
import { ElementosDesgasteService } from './services/elementos-desgaste.service';
import { ElementosDesgasteController } from './controllers/elementos-desgaste.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ElementoDesgaste])],
  controllers: [ElementosDesgasteController],
  providers: [ElementosDesgasteService, ElementosDesgasteRepository],
  exports: [ElementosDesgasteService],
})
export class ElementosDesgasteModule {}