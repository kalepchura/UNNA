import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../../modules/usuarios/usuarios.tokens';
import { randomUUID } from 'crypto';
import * as path from 'path';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const URL_FIRMADA_EXPIRACION_SEGUNDOS = 3600;

export const MIME_TYPES_PERMITIDOS = [
  // Documentos ofimáticos
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // ✅ Temperatura — importaciones de datos
  'text/csv',
  'text/plain',         // algunos navegadores/SO envían CSV como text/plain
  'application/csv',    // variante menos común
  'text/xml',
  'application/xml',
  // Imágenes
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const EXTENSIONES_PERMITIDAS = [
  // Documentos
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  // ✅ Temperatura
  '.csv', '.xml',
  // Imágenes
  '.jpg', '.jpeg', '.png', '.webp',
] as const;

export interface ArchivoSubido {
  nombreArchivo: string;
  rutaStorage: string;
}

export interface ArchivoMulter {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async subir(
    bucket: string,
    archivo: ArchivoMulter,
    subcarpeta?: string,
  ): Promise<ArchivoSubido> {
    if (!archivo) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    if (!archivo.buffer || archivo.buffer.length === 0) {
      throw new BadRequestException('El archivo está vacío');
    }

    this.validarMimeType(archivo.mimetype);

    const extension = path.extname(archivo.originalname).toLowerCase();
    this.validarExtension(extension, archivo.originalname);

    const nombreUnico = `${randomUUID()}${extension}`;
    const rutaCompleta = subcarpeta
      ? `${subcarpeta}/${nombreUnico}`
      : nombreUnico;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(rutaCompleta, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Error subiendo a ${bucket}: ${error.message}`);
      throw new InternalServerErrorException(
        `No se pudo subir el archivo: ${error.message}`,
      );
    }

    return {
      nombreArchivo: archivo.originalname,
      rutaStorage: rutaCompleta,
    };
  }

  async eliminar(bucket: string, rutaStorage: string): Promise<void> {
    if (!rutaStorage) return;

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([rutaStorage]);

    if (error) {
      this.logger.warn(
        `No se pudo eliminar ${rutaStorage} de ${bucket}: ${error.message}`,
      );
    }
  }

  async firmarUrl(
    bucket: string,
    rutaStorage: string,
    expiresIn = URL_FIRMADA_EXPIRACION_SEGUNDOS,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(rutaStorage, expiresIn);

    if (error || !data) {
      throw new InternalServerErrorException(
        `No se pudo generar URL firmada: ${error?.message}`,
      );
    }

    return data.signedUrl;
  }

  private validarMimeType(mimetype: string): void {
    if (!mimetype) {
      throw new BadRequestException('El archivo no tiene tipo MIME');
    }

    if (!MIME_TYPES_PERMITIDOS.includes(mimetype as any)) {
      this.logger.warn(`Intento de subida con MIME no permitido: ${mimetype}`);
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan: PDF, Word, Excel, CSV, XML e imágenes (JPG, PNG, WebP).`,
      );
    }
  }

  private validarExtension(extension: string, nombreOriginal: string): void {
    if (!extension) {
      throw new BadRequestException(
        `El archivo "${nombreOriginal}" no tiene extensión`,
      );
    }

    if (!EXTENSIONES_PERMITIDAS.includes(extension as any)) {
      this.logger.warn(
        `Intento de subida con extensión no permitida: ${extension} (archivo: ${nombreOriginal})`,
      );
      throw new BadRequestException(
        `Extensión "${extension}" no permitida. Solo se aceptan: ${EXTENSIONES_PERMITIDAS.join(', ')}.`,
      );
    }
  }
}