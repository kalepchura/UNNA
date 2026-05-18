import { Injectable, Logger } from '@nestjs/common';
import {
  TemperaturaParser,
  ResultadoParseoTemperatura,
} from './temperatura-parser.interface';
import { Temperatura } from '../entities/temperatura.entity';
import { TEMPERATURA_VALIDACION } from '../../../common/constants/temperatura.constants';

/**
 * ============================================================
 * CsvTemperaturaParser
 * ============================================================
 * Procesa archivos CSV con formato:
 *   Fecha;Hora;Temperatura
 *   01/12/2012;14:30:00;25.50
 *   1/12/2012;14:31:00;25,60
 *
 * Características:
 *  - Encoding ISO-8859-1 (latin1) para archivos guardados con
 *    Bloc de notas (preserva tildes y eñes).
 *  - Separador: ';' (punto y coma).
 *  - Detecta dinámicamente la línea de encabezados.
 *  - Acepta fechas con o sin cero a la izquierda:
 *      1/12/2012, 01/12/2012, 1/2/2012, 01/02/2012
 *  - Acepta hora HH:mm o HH:mm:ss.
 *  - Acepta decimales con ',' o '.'.
 *  - Valida rango contra TEMPERATURA_VALIDACION.
 *  - Filas inválidas se acumulan en `errores` SIN abortar el proceso.
 *
 * Equivalente al CsvTemperaturaParser de tu código Java/Spring.
 * ============================================================
 */
@Injectable()
export class CsvTemperaturaParser implements TemperaturaParser {
  private readonly logger = new Logger(CsvTemperaturaParser.name);

  /**
   * Regex de fecha:
   *   - 1-2 dígitos para día
   *   - 1-2 dígitos para mes
   *   - 4 dígitos para año
   * Acepta: '1/12/2012', '01/12/2012', '1/2/2012', '01/02/2012'
   */
  private readonly REGEX_FECHA = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

  /**
   * Regex de hora:
   *   - HH (00-23)
   *   - mm (00-59)
   *   - ss (opcional, 00-59)
   */
  private readonly REGEX_HORA = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

  // ------------------------------------------------------------
  // MÉTODO PRINCIPAL
  // ------------------------------------------------------------

  async parsear(
    buffer: Buffer,
    importacionId: number,
  ): Promise<ResultadoParseoTemperatura> {
    // 1. Decodificar como ISO-8859-1 (latin1)
    const contenido = buffer.toString('latin1');

    // 2. Dividir en líneas (acepta \n, \r\n, \r)
    const lineas = contenido.split(/\r?\n|\r/);

    // 3. Buscar encabezados y procesar
    const validos: Partial<Temperatura>[] = [];
    const errores: string[] = [];
    let totalFilas = 0;
    let encabezadosEncontrados = false;

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      const numeroFila = i + 1; // 1-based para mensajes humanos

      // Saltar líneas vacías o solo separadores
      if (this.esLineaIgnorable(linea)) continue;

      // Detectar línea de encabezados (caso-insensitive, contiene los 3 nombres)
      if (!encabezadosEncontrados) {
        if (this.esLineaEncabezado(linea)) {
          encabezadosEncontrados = true;
        }
        // Saltamos cualquier línea anterior a los encabezados
        continue;
      }

      // Procesar fila de datos
      totalFilas++;
      try {
        const temp = this.parsearFila(linea, importacionId, numeroFila);
        if (temp) validos.push(temp);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errores.push(`Fila ${numeroFila}: ${msg}`);
      }
    }

    // 4. Si nunca encontramos encabezados → archivo inválido (estructural)
    if (!encabezadosEncontrados) {
      throw new Error(
        "No se encontró la línea de encabezados 'Fecha;Hora;Temperatura' en el archivo CSV",
      );
    }

    return {
      validos,
      errores,
      totalFilas,
    };
  }

  // ------------------------------------------------------------
  // HELPERS PRIVADOS
  // ------------------------------------------------------------

  /**
   * Determina si una línea debe saltarse (vacía o solo ';').
   */
  private esLineaIgnorable(linea: string): boolean {
    const limpia = linea.trim();
    if (limpia.length === 0) return true;
    // Solo separadores: ';;;;'
    if (/^[;]+$/.test(limpia)) return true;
    return false;
  }

  /**
   * Detecta línea de encabezados: contiene 'fecha', 'hora' y 'temperatura'
   * (caso-insensitive). Igual que tu Java original.
   */
  private esLineaEncabezado(linea: string): boolean {
    const lower = linea.toLowerCase();
    return (
      lower.includes('fecha') &&
      lower.includes('hora') &&
      lower.includes('temperatura')
    );
  }

  /**
   * Parsea una fila de datos. Devuelve la entidad lista para persistir
   * o lanza Error con un mensaje descriptivo.
   */
  private parsearFila(
    linea: string,
    importacionId: number,
    _numeroFila: number,
  ): Partial<Temperatura> | null {
    const columnas = linea.split(';');
    if (columnas.length < 3) {
      // Fila truncada: la consideramos error explícito
      throw new Error('Fila incompleta: se esperan 3 columnas (Fecha;Hora;Temperatura)');
    }

    const fechaStr = this.limpiar(columnas[0]);
    const horaStr = this.limpiar(columnas[1]);
    const tempStr = this.limpiar(columnas[2]);

    // Si las 3 columnas están vacías, ignoramos sin contar como error
    // (puede ser una fila vacía con separadores residuales)
    if (!fechaStr && !horaStr && !tempStr) return null;

    // Si alguna está vacía individualmente: error
    if (!fechaStr || !horaStr || !tempStr) {
      throw new Error(
        `Campo vacío en fila (fecha='${fechaStr}', hora='${horaStr}', temp='${tempStr}')`,
      );
    }

    // Parseo individual
    const fecha = this.parsearFecha(fechaStr);
    const hora = this.parsearHora(horaStr);
    const temperatura = this.parsearTemperatura(tempStr);

    return {
      fecha,
      hora,
      // Numeric en BD se acepta como string también; lo dejamos como string
      // con el formato fijo para consistencia.
      temperatura: temperatura.toFixed(2),
      importacionId,
    };
  }

  /**
   * Limpia comillas y espacios. Igual que tu Java original.
   */
  private limpiar(valor: string | undefined): string {
    if (valor === undefined) return '';
    return valor.trim().replace(/"/g, '').replace(/\r/g, '');
  }

  /**
   * Parsea una fecha en formato 'd/M/yyyy' donde día y mes pueden
   * tener 1 o 2 dígitos.
   *
   * SOLUCIÓN AL BUG DE TU JAVA: la regex acepta tanto '1/12/2012'
   * como '01/12/2012' sin necesidad de relleno previo.
   */
  private parsearFecha(fechaStr: string): Date {
    const match = fechaStr.match(this.REGEX_FECHA);
    if (!match) {
      throw new Error(`Formato de fecha inválido: '${fechaStr}'. Esperado: d/M/yyyy o dd/MM/yyyy`);
    }

    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    const anio = parseInt(match[3], 10);

    // Validación lógica de rangos (no solo regex)
    if (mes < 1 || mes > 12) {
      throw new Error(`Mes inválido en fecha '${fechaStr}': ${mes}`);
    }
    if (dia < 1 || dia > 31) {
      throw new Error(`Día inválido en fecha '${fechaStr}': ${dia}`);
    }

    // Construimos UTC para evitar saltos de zona horaria
    // (las fechas en BD son DATE puro, sin hora, así que UTC nos da
    // un día consistente independiente del servidor)
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));

    // Validación final: que la fecha construida sea coherente
    // (ej: 31/02/2024 saldría como 2 de marzo si no validamos)
    if (
      fecha.getUTCFullYear() !== anio ||
      fecha.getUTCMonth() !== mes - 1 ||
      fecha.getUTCDate() !== dia
    ) {
      throw new Error(`Fecha calendario inválida: '${fechaStr}'`);
    }

    return fecha;
  }

  /**
   * Parsea una hora en formato 'HH:mm' o 'HH:mm:ss'.
   * Devuelve string en formato 'HH:mm:ss' (que es lo que espera
   * Postgres TIME).
   */
  private parsearHora(horaStr: string): string {
    const match = horaStr.match(this.REGEX_HORA);
    if (!match) {
      throw new Error(`Formato de hora inválido: '${horaStr}'. Esperado: HH:mm o HH:mm:ss`);
    }

    const hh = parseInt(match[1], 10);
    const mm = parseInt(match[2], 10);
    const ss = match[3] ? parseInt(match[3], 10) : 0;

    if (hh < 0 || hh > 23) {
      throw new Error(`Hora inválida: ${hh} en '${horaStr}'`);
    }
    if (mm < 0 || mm > 59) {
      throw new Error(`Minutos inválidos: ${mm} en '${horaStr}'`);
    }
    if (ss < 0 || ss > 59) {
      throw new Error(`Segundos inválidos: ${ss} en '${horaStr}'`);
    }

    // Devolvemos siempre en formato HH:mm:ss para consistencia en BD
    return `${this.pad2(hh)}:${this.pad2(mm)}:${this.pad2(ss)}`;
  }

  /**
   * Parsea una temperatura. Acepta:
   *  - Decimal con punto: '25.50'
   *  - Decimal con coma: '25,50'
   *  - Negativos: '-5.0'
   *  - Hasta 2 decimales (más se trunca por toFixed)
   *
   * Valida contra el rango de TEMPERATURA_VALIDACION.
   */
  private parsearTemperatura(tempStr: string): number {
    // Normalizamos coma a punto
    const normalizado = tempStr.replace(',', '.');

    // parseFloat es más permisivo que Number; nos sirve aquí
    const valor = parseFloat(normalizado);

    if (Number.isNaN(valor)) {
      throw new Error(`Temperatura no es un número válido: '${tempStr}'`);
    }

    if (
      valor < TEMPERATURA_VALIDACION.MIN_CELSIUS ||
      valor > TEMPERATURA_VALIDACION.MAX_CELSIUS
    ) {
      throw new Error(
        `Temperatura fuera de rango ` +
          `[${TEMPERATURA_VALIDACION.MIN_CELSIUS}, ${TEMPERATURA_VALIDACION.MAX_CELSIUS}]: ${valor}`,
      );
    }

    return valor;
  }

  /** Helper: número a string de 2 dígitos con cero a la izquierda. */
  private pad2(n: number): string {
    return n.toString().padStart(2, '0');
  }
}