import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UsuarioApp } from './entities/usuario-app.entity';
import { UsuariosRepository } from './repositories/usuarios.repository';
import { UsuariosService } from './services/usuarios.service';
import { UsuariosController } from './controllers/usuarios.controller';
import { createSupabaseAdminClient } from '../../config/supabase.config';
import { SUPABASE_ADMIN_CLIENT } from './usuarios.tokens';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UsuarioApp])],
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    UsuariosRepository,
    {
      // Provider personalizado: crea el cliente Supabase admin
      // y lo registra bajo el token SUPABASE_ADMIN_CLIENT.
      provide: SUPABASE_ADMIN_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createSupabaseAdminClient(configService),
    },
  ],
  exports: [
    // Exportamos el repository y el service para que el módulo Auth
    // (y futuros módulos) puedan inyectarlos.
    UsuariosService,
    UsuariosRepository,
    SUPABASE_ADMIN_CLIENT,
  ],
})
export class UsuariosModule {}