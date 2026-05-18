import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tramo } from './entities/tramo.entity';
import { TramosRepository } from './repositories/tramos.repository';
import { TramosService } from './services/tramos.service';
import { TramosController } from './controllers/tramos.controller';

/**
 * ============================================================
 * TramosModule
 * ============================================================
 * Módulo que agrupa todo lo relacionado al catálogo Tramos.
 *
 * Exporta el TramosService para que otros módulos
 * (Fallas, Temperatura, Desgaste) puedan inyectarlo y usar
 * sus métodos de dominio (resolverPorProgresiva, etc.).
 * ============================================================
 */
@Module({
  imports: [
    // Registra la entidad Tramo dentro de este módulo.
    // Esto habilita @InjectRepository(Tramo) en el repository.
    TypeOrmModule.forFeature([Tramo]),
  ],
  controllers: [TramosController],
  providers: [
    TramosService,
    TramosRepository,
  ],
  exports: [
    // Exportamos el service para que otros módulos lo usen.
    TramosService,
  ],
})
export class TramosModule {}