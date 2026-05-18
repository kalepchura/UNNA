import { TipoArchivoTemperatura } from '../../../common/enums';

/**
 * RESPONSE DTO de una importación recién creada.
 * Resume al usuario qué pasó.
 */
export class ImportacionResultadoDto {
  importacionId!: number;
  nombreArchivo!: string;
  tipoArchivo!: TipoArchivoTemperatura;
  progresiva!: number;
  tramoId!: number;
  tramoCodigo!: string;
  tramoNombre!: string;

  totalRegistros!: number;
  registrosValidos!: number;
  registrosInvalidos!: number;

  /**
   * Solo si hubo errores. Limitamos a los primeros 50 para no
   * inflar la respuesta. Si hubo más, se ven en la BD/log.
   */
  primerosErrores!: string[];

  fechaSubida!: Date;
}