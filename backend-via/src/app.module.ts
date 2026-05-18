import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { TramosModule } from './modules/catalogos/tramos/tramos.module';
import { EstacionesModule } from './modules/catalogos/estaciones/estaciones.module';
import { CurvasHorizontalesModule } from './modules/catalogos/curvas-horizontales/curvas-horizontales.module';
import { CurvasVerticalesModule } from './modules/catalogos/curvas-verticales/curvas-verticales.module';
import { VelocidadesModule } from './modules/catalogos/velocidades/velocidades.module';
import { CambiaviasModule } from './modules/catalogos/cambiavias/cambiavias.module';
import { ElementosDesgasteModule } from './modules/catalogos/elementos-desgaste/elementos-desgaste.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { CommonServicesModule } from './common/services/services.module';
import { FallasModule } from './modules/fallas/fallas.module';
import { TemperaturaModule } from './modules/temperatura/temperatura.module';
import { DesgasteModule } from './modules/desgaste/desgaste.module';
import { MapaCalorModule } from './modules/mapa-calor/mapa-calor.module';
/**
 * ============================================================
 * AppModule
 * ============================================================
 * Módulo raíz del backend. Aquí se registran:
 *  - ConfigModule: lee variables de entorno (.env)
 *  - TypeOrmModule: conecta a PostgreSQL (Supabase)
 *  - Todos los módulos de negocio (cuando los vayamos creando)
 * ============================================================
 */
@Module({
  imports: [
    // ----------------------------------------------------------
    // 1. CONFIG MODULE
    // ----------------------------------------------------------
    // Lee el archivo .env y hace que las variables estén
    // disponibles vía ConfigService.get('NOMBRE_VARIABLE').
    //
    // isGlobal: true → no hace falta importarlo en cada módulo
    //                 hijo, queda disponible globalmente.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ----------------------------------------------------------
    // 2. TYPEORM MODULE
    // ----------------------------------------------------------
    // Conecta a la base de datos PostgreSQL de Supabase.
    //
    // Usamos forRootAsync (en vez de forRoot) porque la config
    // depende de variables de entorno, que solo están listas
    // después de ConfigModule.
    TypeOrmModule.forRootAsync({
      // Le decimos que necesita ConfigService para construir la config
      inject: [ConfigService],
      imports: [ConfigModule],
      // Función que construye la config (la definimos en database.config.ts)
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    // ----------------------------------------------------------
    // 3. MÓDULOS DE NEGOCIO
    // ----------------------------------------------------------
    // Aquí iremos sumando los módulos a medida que los creemos.
    // Por ahora ninguno (Fase 0 es solo infraestructura).

    UsuariosModule,

    AuditoriaModule,
    AuthModule,

    CommonServicesModule,
    

    TramosModule,
    EstacionesModule,
    CurvasHorizontalesModule,
    CurvasVerticalesModule,
    VelocidadesModule,
    CambiaviasModule,
    ElementosDesgasteModule,
    FallasModule,
    TemperaturaModule,
    DesgasteModule,
    MapaCalorModule, 
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}