import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  TemperaturaParser,
  ResultadoParseoTemperatura,
} from './temperatura-parser.interface';

/**
 * Parser de archivos XML.
 *
 * STUB: aún no implementado. Cuando lo necesites, instalamos
 * `fast-xml-parser` y rellenamos `parsear`.
 */
@Injectable()
export class XmlTemperaturaParser implements TemperaturaParser {
  async parsear(
    _buffer: Buffer,
    _importacionId: number,
  ): Promise<ResultadoParseoTemperatura> {
    throw new NotImplementedException(
      'Importación desde XML aún no está disponible. Por favor use formato CSV.',
    );
  }
}