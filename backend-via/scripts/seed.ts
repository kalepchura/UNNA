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
import { UsuarioApp } from '../src/modules/usuarios/entities/usuario-app.entity';

// Seeds
import { seedTramos } from './seeds/tramos.seed';
import { seedEstaciones } from './seeds/estaciones.seed';
import { seedCurvasHorizontales } from './seeds/curvas-horizontales.seed';
import { seedCurvasVerticales } from './seeds/curvas-verticales.seed';
import { seedVelocidades } from './seeds/velocidades.seed';
import { seedCambiavias } from './seeds/cambiavias.seed';
import { seedElementosDesgaste } from './seeds/elementos-desgaste.seed';
import { seedAdminInicial } from './seeds/admin-inicial.seed';
import { seedEscenarioReal } from './seeds/escenario-real.seed';

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
    // ---------------------------------------------------
    // LIMPIAR TABLAS
    // ---------------------------------------------------

    console.log('🗑️ Limpiando tablas...');

    await dataSource.query(
      'TRUNCATE TABLE mediciones_desgaste RESTART IDENTITY CASCADE',
    );

    await dataSource.query(
      'TRUNCATE TABLE elementos_desgaste RESTART IDENTITY CASCADE',
    );

    await dataSource.query(
      'TRUNCATE TABLE cambiavias RESTART IDENTITY CASCADE',
    );

    await dataSource.query(
      'TRUNCATE TABLE curvas_horizontales RESTART IDENTITY CASCADE',
    );

    await dataSource.query(
      'TRUNCATE TABLE curvas_verticales RESTART IDENTITY CASCADE',
    );

    await dataSource.query(
      'TRUNCATE TABLE velocidades RESTART IDENTITY CASCADE',
    );

    await dataSource.query(
      'TRUNCATE TABLE estaciones RESTART IDENTITY CASCADE',
    );

    await dataSource.query(
      'TRUNCATE TABLE tramos RESTART IDENTITY CASCADE',
    );

    console.log('✅ Tablas limpias\n');

    // ---------------------------------------------------
    // SEEDS
    // ---------------------------------------------------

    await seedAdminInicial(dataSource);

    // Obtener admin luego de crearlo
    const adminResult = await dataSource.query(
      `SELECT id FROM usuarios_app LIMIT 1`,
    );

    if (!adminResult.length) {
      throw new Error(
        'No se encontró usuario admin luego del seed',
      );
    }

    const adminId = adminResult[0].id;

    await seedTramos(dataSource);
    await seedEstaciones(dataSource);
    await seedCurvasHorizontales(dataSource);
    await seedCurvasVerticales(dataSource);
    await seedVelocidades(dataSource);
    await seedCambiavias(dataSource);
    await seedElementosDesgaste(dataSource);

    await seedEscenarioReal(dataSource, adminId);

    console.log('\n🎉 Seed completado con éxito');
  } catch (error) {
    console.error('❌ Error durante seed:', error);

    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

ejecutarSeeds();