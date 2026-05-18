import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  TemperaturaParser,
  ResultadoParseoTemperatura,
} from './temperatura-parser.interface';

/**
 * Parser de archivos Excel (.xlsx / .xls).
 *
 * STUB: aún no implementado. Cuando lo necesites, instalamos
 * la librería `exceljs` (o reutilizamos `xlsx` si ya la tenemos)
 * y rellenamos el método `parsear`.
 */
@Injectable()
export class ExcelTemperaturaParser implements TemperaturaParser {
  async parsear(
    _buffer: Buffer,
    _importacionId: number,
  ): Promise<ResultadoParseoTemperatura> {
    throw new NotImplementedException(
      'Importación desde Excel aún no está disponible. Por favor use formato CSV.',
    );
  }
}