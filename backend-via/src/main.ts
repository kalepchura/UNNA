import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * ============================================================
 * Punto de entrada del backend.
 * ============================================================
 * Este archivo se ejecuta cuando corres `npm run start:dev`.
 *
 * Pasos:
 *  1. Crea la aplicación NestJS a partir de AppModule.
 *  2. Configura CORS, prefijo global y validación.
 *  3. Pone el server a escuchar en el puerto del .env.
 * ============================================================
 */
async function bootstrap() {
  // 1. Crear la app
  const app = await NestFactory.create(AppModule);

  // 2. CORS — permite que el frontend (en otro puerto/dominio) llame al backend
  // En desarrollo dejamos abierto. En producción se restringe a tu dominio.
  app.enableCors({
    origin: ['http://localhost:5173'], // refleja el origin que viene en la request (cualquier origen)
    credentials: true, // permite enviar cookies/headers de auth
  });

  // 3. Prefijo global de todas las rutas
  // Endpoint /tramos quedará en /api/v1/tramos
  // Esto permite versionar la API en el futuro (v2, v3...).
  app.setGlobalPrefix('api/v1');

  // 4. Validación automática de DTOs
  // Cuando llegue un request, NestJS validará el body contra el DTO
  // (con sus decoradores @IsString, @IsNumber, etc.) y rechazará
  // automáticamente lo inválido con un 400.
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: elimina propiedades que NO están en el DTO
      // (protege contra envío de campos extra maliciosos)
      whitelist: true,

      // forbidNonWhitelisted: si llegan campos extra, devuelve 400
      // en vez de simplemente quitarlos. Más estricto.
      forbidNonWhitelisted: true,

      // transform: convierte tipos automáticamente
      // Ej: si el DTO espera number y llega string "42", lo convierte.
      transform: true,
    }),
  );

  // 5. Leer el puerto del .env (default 3000 si no está definido)
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // 6. Arrancar
  await app.listen(port);
  console.log(`🚀 Backend corriendo en: http://localhost:${port}/api/v1`);
}

bootstrap();