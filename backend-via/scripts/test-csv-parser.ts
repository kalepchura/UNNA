/**
 * Script aislado para probar el CsvTemperaturaParser.
 * NO usa NestJS: instancia el parser directamente.
 *
 * Ejecutar:
 *   npx ts-node scripts/test-csv-parser.ts
 */
import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { CsvTemperaturaParser } from '../src/modules/temperatura/parsers/csv-temperatura.parser';

async function main() {
  const archivoPath = path.join(__dirname, '../test-files/temperatura-prueba.csv');

  if (!fs.existsSync(archivoPath)) {
    console.error('❌ No existe el archivo:', archivoPath);
    process.exit(1);
  }

  const buffer = fs.readFileSync(archivoPath);
  console.log(`📄 Archivo cargado: ${archivoPath} (${buffer.length} bytes)\n`);

  const parser = new CsvTemperaturaParser();
  const importacionIdSimulado = 999;

  try {
    const resultado = await parser.parsear(buffer, importacionIdSimulado);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  RESULTADO DEL PARSEO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total filas detectadas:  ${resultado.totalFilas}`);
    console.log(`Filas válidas:           ${resultado.validos.length}`);
    console.log(`Filas inválidas:         ${resultado.errores.length}`);

    if (resultado.validos.length > 0) {
      console.log('\n✅ FILAS VÁLIDAS:');
      resultado.validos.forEach((v, i) => {
        const fecha = v.fecha instanceof Date
          ? v.fecha.toISOString().split('T')[0]
          : v.fecha;
        console.log(`  ${i + 1}. fecha=${fecha} hora=${v.hora} temp=${v.temperatura}`);
      });
    }

    if (resultado.errores.length > 0) {
      console.log('\n❌ ERRORES:');
      resultado.errores.forEach((e) => console.log(`  - ${e}`));
    }

    console.log('\n🎉 Parseo completado sin errores estructurales\n');
  } catch (err) {
    console.error('❌ Error estructural del archivo:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();