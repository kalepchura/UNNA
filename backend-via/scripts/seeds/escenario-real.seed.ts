import { DataSource } from 'typeorm';
import { ESCENARIO_REAL_NOMBRE } from '../../src/common/constants/desgaste.constants';

export async function seedEscenarioReal(dataSource: DataSource, adminId: string): Promise<void> {
  await dataSource.query(`
    INSERT INTO escenarios_mtb (nombre, descripcion, creado_por, creado_en, actualizado_en, eliminado)
    VALUES ($1, $2, $3, NOW(), NOW(), false)
    ON CONFLICT (nombre) DO NOTHING
  `, [ESCENARIO_REAL_NOMBRE, 'Mediciones reales registradas en campo', adminId]);

  console.log('✅ Escenario REAL sembrado');
}