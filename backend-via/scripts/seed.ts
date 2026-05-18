import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Entidades
import { Tramo } from '../src/modules/catalogos/tramos/entities/tramo.entity';
import { Estacion } from '../src/modules/catalogos/estaciones/entities/estacion.entity';
import { CurvaHorizontal } from '../src/modules/catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../src/modules/catalogos/curvas-verticales/entities/curva-vertical.entity';
import { Velocidad } from '../src/modules/catalogos/velocidades/entities/velocidad.entity';
import { Cambiavia } from '../src/modules/catalogos/cambiavias/entities/cambiavia.entity';
import { ElementoDesgaste } from '../src/modules/catalogos/elementos-desgaste/entities/elemento-desgaste.entity';

// Seeds
import { seedTramos } from './seeds/tramos.seed';
import { seedEstaciones } from './seeds/estaciones.seed';
import { seedCurvasHorizontales } from './seeds/curvas-horizontales.seed';
import { seedCurvasVerticales } from './seeds/curvas-verticales.seed';
import { seedVelocidades } from './seeds/velocidades.seed';
import { seedCambiavias } from './seeds/cambiavias.seed';
import { seedElementosDesgaste } from './seeds/elementos-desgaste.seed';
import { UsuarioApp } from '../src/modules/usuarios/entities/usuario-app.entity';
import { seedAdminInicial } from './seeds/admin-inicial.seed';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [
    Tramo,
    Estacion,
    CurvaHorizontal,
    CurvaVertical,
    Velocidad,
    Cambiavia,
    ElementoDesgaste,
    UsuarioApp,
  ],
  synchronize: false,
});

async function ejecutarSeeds() {
  console.log('🌱 Iniciando seed...\n');
  await dataSource.initialize();
  console.log('✅ Conexión a BD establecida\n');

  try {
        // Limpiar con CASCADE para respetar FK
    console.log('🗑️  Limpiando tablas de catálogos...');
    await dataSource.query('TRUNCATE TABLE mediciones_desgaste CASCADE');
    await dataSource.query('TRUNCATE TABLE elementos_desgaste CASCADE');
    await dataSource.query('TRUNCATE TABLE cambiavias CASCADE');
    await dataSource.query('TRUNCATE TABLE curvas_horizontales CASCADE');
    await dataSource.query('TRUNCATE TABLE curvas_verticales CASCADE');
    await dataSource.query('TRUNCATE TABLE velocidades CASCADE');
    await dataSource.query('TRUNCATE TABLE estaciones CASCADE');
    await dataSource.query('TRUNCATE TABLE tramos CASCADE');
    console.log('✅ Tablas limpias\n');

    // INSERTAR en orden normal
    await seedAdminInicial(dataSource);
    await seedTramos(dataSource);
    await seedEstaciones(dataSource);
    await seedCurvasHorizontales(dataSource);
    await seedCurvasVerticales(dataSource);
    await seedVelocidades(dataSource);
    await seedCambiavias(dataSource);
    await seedElementosDesgaste(dataSource);

    console.log('\n🎉 Seed completado con éxito');
  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}
ejecutarSeeds();