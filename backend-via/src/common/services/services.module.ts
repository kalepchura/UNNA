import { Global, Module } from '@nestjs/common';
import { GeolocalizacionService } from './geolocalizacion.service';
import { StorageService } from './storage.service';
import { TramosModule } from '../../modules/catalogos/tramos/tramos.module';
import { CurvasHorizontalesModule } from '../../modules/catalogos/curvas-horizontales/curvas-horizontales.module';
import { CurvasVerticalesModule } from '../../modules/catalogos/curvas-verticales/curvas-verticales.module';
import { VelocidadesModule } from '../../modules/catalogos/velocidades/velocidades.module';
import { UsuariosModule } from '../../modules/usuarios/usuarios.module';

/**
 * Módulo global de servicios compartidos.
 * StorageService usa SUPABASE_ADMIN_CLIENT que ya está disponible
 * gracias a UsuariosModule (también global).
 */
@Global()
@Module({
  imports: [
    UsuariosModule,
    TramosModule,
    CurvasHorizontalesModule,
    CurvasVerticalesModule,
    VelocidadesModule,
  ],
  providers: [GeolocalizacionService, StorageService],
  exports: [GeolocalizacionService, StorageService],
})
export class CommonServicesModule {}