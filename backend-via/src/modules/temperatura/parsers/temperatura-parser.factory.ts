import {
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import type { TemperaturaParser } from './temperatura-parser.interface';
import { TipoArchivoTemperatura } from '../../../common/enums';
import {
  PARSER_CSV,
  PARSER_EXCEL,
  PARSER_XML,
} from './parser.tokens';

/**
 * ============================================================
 * TemperaturaParserFactory
 * ============================================================
 * Selector de parser según extensión / tipo de archivo.
 *
 * Equivalente al "if csv → CsvTemperaturaParser, if xlsx →
 * ExcelTemperaturaParser, ..." que tenías en Spring, pero como
 * factory inyectable.
 *
 * Si más adelante agregas nuevos formatos (JSON, TXT, etc.),
 * solo extiendes:
 *  1. Agregar valor al enum TipoArchivoTemperatura
 *  2. Crear nuevo parser que implemente TemperaturaParser
 *  3. Registrarlo en TemperaturaModule con su token
 *  4. Agregar el case aquí
 * ============================================================
 */
@Injectable()
export class TemperaturaParserFactory {
  constructor(
    @Inject(PARSER_CSV) private readonly csvParser: TemperaturaParser,
    @Inject(PARSER_EXCEL) private readonly excelParser: TemperaturaParser,
    @Inject(PARSER_XML) private readonly xmlParser: TemperaturaParser,
  ) {}

  /**
   * Devuelve el parser apropiado según el tipo declarado.
   */
  obtenerParser(tipo: TipoArchivoTemperatura): TemperaturaParser {
    switch (tipo) {
      case TipoArchivoTemperatura.CSV:
        return this.csvParser;
      case TipoArchivoTemperatura.EXCEL:
        return this.excelParser;
      case TipoArchivoTemperatura.XML:
        return this.xmlParser;
      default:
        throw new BadRequestException(`Tipo de archivo no soportado: ${tipo}`);
    }
  }

  /**
   * Detecta el tipo a partir del nombre/extension del archivo.
   * Útil para que el cliente NO tenga que mandar el tipo aparte.
   */
  detectarTipo(nombreArchivo: string): TipoArchivoTemperatura {
    const nombre = nombreArchivo.toLowerCase();

    if (nombre.endsWith('.csv')) return TipoArchivoTemperatura.CSV;
    if (nombre.endsWith('.xlsx') || nombre.endsWith('.xls')) return TipoArchivoTemperatura.EXCEL;
    if (nombre.endsWith('.xml')) return TipoArchivoTemperatura.XML;

    throw new BadRequestException(
      `Extensión no reconocida en archivo "${nombreArchivo}". ` +
      `Formatos soportados: .csv, .xlsx, .xls, .xml`,
    );
  }
}