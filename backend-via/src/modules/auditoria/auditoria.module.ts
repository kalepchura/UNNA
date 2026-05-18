import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaLog } from './entities/auditoria-log.entity';
import { AuditoriaRepository } from './repositories/auditoria.repository';
import { AuditoriaService } from './services/auditoria.service';
import { EliminadosResumenService } from './services/eliminados-resumen.service';
import { AuditoriaController } from './controllers/auditoria.controller';
import { FallasModule } from '../fallas/fallas.module';
import { TemperaturaModule } from '../temperatura/temperatura.module';
import { DesgasteModule } from '../desgaste/desgaste.module';

/**
 * AuditoriaModule
 *
 * @Global() para que AuditoriaService esté disponible globalmente.
 * Importa los módulos transaccionales (con forwardRef) porque
 * EliminadosResumenService consume sus services.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditoriaLog]),
    forwardRef(() => FallasModule),
    forwardRef(() => TemperaturaModule),
    forwardRef(() => DesgasteModule),  
  ],
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    AuditoriaRepository,
    EliminadosResumenService,
  ],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}