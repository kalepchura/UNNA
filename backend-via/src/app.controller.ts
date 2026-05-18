import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Controller de utilidad. Tiene un endpoint /health que confirma:
 *  - El backend está vivo
 *  - La conexión a la base de datos funciona
 *
 * Útil para diagnóstico y para que un balanceador de carga
 * (en producción) sepa si el server está sano.
 */
@Controller()
export class AppController {
  constructor(
    // Inyectamos el DataSource de TypeORM para hacer un ping a la BD
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get('health')
  async health() {
    // Hacemos una consulta trivial: SELECT 1
    // Si la BD responde, todo OK. Si lanza error, retornamos status: 'down'.
    let dbStatus = 'down';
    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'up';
    } catch (error) {
      dbStatus = 'down';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    };
  }
}