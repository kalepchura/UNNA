// Importamos los tipos necesarios de TypeORM y NestJS
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Función que construye la configuración de TypeORM.
 * 
 * Se exporta como factory (función) en vez de objeto fijo, porque
 * necesitamos leer las variables de entorno (.env) que solo están
 * disponibles cuando ConfigService está listo.
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  // Tipo de motor de base de datos. Supabase usa PostgreSQL por debajo.
  type: 'postgres',

  // Connection string completa (la del .env). TypeORM la parsea sola.
  url: configService.get<string>('DATABASE_URL'),

  // Supabase requiere SSL. Esto le dice "confía aunque el certificado
  // no esté en tu lista local". Es estándar para conexiones cloud.
  ssl: { rejectUnauthorized: false },

  // Le dice a TypeORM que busque automáticamente todos los archivos
  // que terminen en .entity.ts (o .entity.js compilado) dentro de src/
  // y los registre como tablas.
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // ⚠️ IMPORTANTE: synchronize: true hace que TypeORM cree/modifique
  // las tablas automáticamente al iniciar. Es cómodo en DESARROLLO,
  // pero PELIGROSO en producción (puede borrar datos).
  // Lo dejamos true mientras desarrollamos. Antes de producción lo
  // cambiamos a false y usamos migraciones.
  synchronize: true,

  // Muestra en consola cada SQL que ejecuta TypeORM. Útil para entender
  // qué está pasando. Ponlo en false si te molesta el ruido.
  logging: true,
});