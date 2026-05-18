import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ImagenesFallaRepository } from '../repositories/imagenes-falla.repository';
import { FallasSoldaduraInoxRepository } from '../repositories/fallas-soldadura-inox.repository';
import { ImagenFallaResponseDto } from '../dto/imagen-falla/imagen-falla-response.dto';
import {
  StorageService,
  ArchivoMulter,
  URL_FIRMADA_EXPIRACION_SEGUNDOS,
} from '../../../common/services/storage.service';
import { STORAGE_BUCKETS } from '../../../common/constants/storage-buckets';
import { AuditoriaService } from '../../auditoria/services/auditoria.service';
import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

/**
 * ============================================================
 * ImagenesFallaService
 * ============================================================
 * Gestión de imágenes asociadas a FallaSoldaduraInox.
 *
 * Características:
 *  - Múltiples imágenes por falla (sin límite definido)
 *  - Eliminación física (no soft delete): si se borra, se pierde
 *  - Storage: bucket FALLAS_SOLDADURA_INOX en Supabase
 *
 * 🔒 SEGURIDAD:
 *  - Validación MIME y tamaño se aplica a nivel de controller
 *  - El StorageService valida MIME/extensión como defensa en profundidad
 *
 * 🎯 Las operaciones de imagen NO invalidan caché analítica
 * porque las imágenes no afectan KPIs ni gráficos.
 * ============================================================
 */
@Injectable()
export class ImagenesFallaService {
  constructor(
    private readonly imagenesRepo: ImagenesFallaRepository,
    private readonly fallasRepo: FallasSoldaduraInoxRepository,
    private readonly storage: StorageService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ----------------------------------------------------------
  // LISTAR
  // ----------------------------------------------------------

  /**
   * Lista todas las imágenes asociadas a una falla activa.
   *
   * ✨ Rechaza listar imágenes de fallas eliminadas para evitar
   * inconsistencias en la UI.
   */
  async listarPorFalla(fallaId: number): Promise<ImagenFallaResponseDto[]> {
    const falla = await this.fallasRepo.buscarPorId(fallaId);
    if (!falla) {
      throw new NotFoundException(`FallaSoldaduraInox ${fallaId} no encontrada`);
    }

    const imagenes = await this.imagenesRepo.listarPorFalla(fallaId);
    return imagenes.map((i) => ImagenFallaResponseDto.fromEntity(i));
  }

  // ----------------------------------------------------------
  // SUBIR
  // ----------------------------------------------------------

  /**
   * Sube una nueva imagen a una falla.
   *
   * 🚨 ORDEN SEGURO:
   *  1. Subir a Storage (si falla, nada que limpiar)
   *  2. Persistir en BD (si falla, eliminamos el archivo huérfano)
   *
   * El controller ya validó MIME y tamaño, pero StorageService
   * los valida de nuevo (defensa en profundidad).
   */
  async subir(
    fallaId: number,
    archivo: ArchivoMulter,
    user: AuthenticatedUser,
  ): Promise<ImagenFallaResponseDto> {
    const falla = await this.fallasRepo.buscarPorId(fallaId);
    if (!falla) {
      throw new NotFoundException(`FallaSoldaduraInox ${fallaId} no encontrada`);
    }

    if (falla.eliminado) {
      throw new BadRequestException(
        `No se pueden agregar imágenes a una falla eliminada`,
      );
    }

    // 1. Subir a Storage
    const subcarpeta = `falla-${fallaId}`;
    const subido = await this.storage.subir(
      STORAGE_BUCKETS.FALLAS_SOLDADURA_INOX,
      archivo,
      subcarpeta,
    );

    // 2. Persistir en BD (si falla, limpiar el archivo huérfano)
    let creada;
    try {
      creada = await this.imagenesRepo.crear({
        fallaId,
        nombreArchivo: subido.nombreArchivo,
        urlArchivo: subido.rutaStorage,
      });
    } catch (err) {
      // Rollback manual del storage
      await this.storage.eliminar(
        STORAGE_BUCKETS.FALLAS_SOLDADURA_INOX,
        subido.rutaStorage,
      );
      throw err;
    }

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: 'ImagenFalla',
      entidadId: String(creada.id),
      operacion: OperacionAuditoria.CREATE,
      user,
      detalle: { fallaId, nombre: subido.nombreArchivo },
    });

    return ImagenFallaResponseDto.fromEntity(creada);
  }

  // ----------------------------------------------------------
  // ELIMINAR
  // ----------------------------------------------------------

  /**
   * Elimina una imagen específica (eliminación física).
   *
   * 🚨 ORDEN SEGURO:
   *  1. Eliminar de BD primero (si falla, el archivo sigue accesible)
   *  2. Eliminar del Storage (si falla, queda huérfano pero la BD ya está limpia)
   *
   * Si quedara un archivo huérfano en storage, un job de limpieza
   * podría recogerlo más adelante (no es crítico).
   */
  async eliminar(imagenId: number, user: AuthenticatedUser): Promise<void> {
    const imagen = await this.imagenesRepo.buscarPorId(imagenId);
    if (!imagen) {
      throw new NotFoundException(`Imagen ${imagenId} no encontrada`);
    }

    // 1. Eliminar de BD primero
    await this.imagenesRepo.eliminar(imagen);

    // 2. Recién ahora eliminar del Storage
    // (si falla, la BD ya no la referencia, archivo huérfano no rompe nada)
    await this.storage.eliminar(
      STORAGE_BUCKETS.FALLAS_SOLDADURA_INOX,
      imagen.urlArchivo,
    );

    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.FALLAS,
      entidad: 'ImagenFalla',
      entidadId: String(imagenId),
      operacion: OperacionAuditoria.DELETE,
      user,
      detalle: { fallaId: imagen.fallaId },
    });
  }

  // ----------------------------------------------------------
  // URL FIRMADA
  // ----------------------------------------------------------

  /**
   * Genera URL firmada temporal para visualizar/descargar la imagen.
   * Validez por defecto: 1 hora (URL_FIRMADA_EXPIRACION_SEGUNDOS).
   */
  async obtenerUrl(imagenId: number): Promise<{ url: string; nombre: string }> {
    const imagen = await this.imagenesRepo.buscarPorId(imagenId);
    if (!imagen) {
      throw new NotFoundException(`Imagen ${imagenId} no encontrada`);
    }

    const url = await this.storage.firmarUrl(
      STORAGE_BUCKETS.FALLAS_SOLDADURA_INOX,
      imagen.urlArchivo,
      URL_FIRMADA_EXPIRACION_SEGUNDOS,
    );

    return { url, nombre: imagen.nombreArchivo };
  }
}