import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FallasSoldaduraInoxService } from '../services/fallas-soldadura-inox.service';
import { ImagenesFallaService } from '../services/imagenes-falla.service';
import { CrearFallaSoldaduraInoxDto } from '../dto/falla-soldadura-inox/crear-falla-soldadura-inox.dto';
import { ActualizarFallaSoldaduraInoxDto } from '../dto/falla-soldadura-inox/actualizar-falla-soldadura-inox.dto';
import { FiltrarFallasSoldaduraInoxDto } from '../dto/falla-soldadura-inox/filtrar-fallas-soldadura-inox.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { RolUsuario } from '../../../common/enums';

import type { ArchivoMulter } from '../../../common/services/storage.service';
import {
  MAX_FILE_SIZE_BYTES,
  MIME_TYPES_PERMITIDOS,
} from '../../../common/services/storage.service';

/**
 * ============================================================
 * FallasSoldaduraInoxController
 * ============================================================
 * Endpoints CRUD + imágenes para FallaSoldaduraInox.
 *
 * Acceso: USUARIO y ADMINISTRADOR pueden hacer todo el CRUD.
 * Solo ADMINISTRADOR puede:
 *  - Restaurar registros eliminados
 *  - Listar registros eliminados (página de auditoría)
 *
 * 🔒 SEGURIDAD:
 *  - JWT + RolesGuard a nivel de controller
 *  - Validación de tipo de archivo (MIME) en subida de imágenes
 *  - Validación de tamaño máximo (10 MB) en imágenes
 * ============================================================
 */
@Controller('fallas/soldadura-inox')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class FallasSoldaduraInoxController {
  constructor(
    private readonly service: FallasSoldaduraInoxService,
    private readonly imagenesService: ImagenesFallaService,
  ) {}

  // ----------------------------------------------------------
  // LISTADO Y BÚSQUEDA
  // ----------------------------------------------------------

  /**
   * POST /api/v1/fallas/soldadura-inox/buscar
   * Lista paginada con filtros. Solo registros activos.
   */
  @Post('buscar')
  @HttpCode(HttpStatus.OK)
  listar(@Body() filtros: FiltrarFallasSoldaduraInoxDto) {
    return this.service.listar(filtros);
  }

  /**
   * POST /api/v1/fallas/soldadura-inox/eliminados
   * Lista paginada de registros soft-deleted.
   * EXCLUSIVO para ADMINISTRADOR (página de auditoría).
   */
  @Post('eliminados')
  @HttpCode(HttpStatus.OK)
  @Roles(RolUsuario.ADMINISTRADOR)
  listarEliminados(@Body() filtros: FiltrarFallasSoldaduraInoxDto) {
    return this.service.listarEliminados(filtros);
  }

  /**
   * GET /api/v1/fallas/soldadura-inox/:id
   * Detalle de una falla por id (solo activas).
   */
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  // ----------------------------------------------------------
  // CRUD
  // ----------------------------------------------------------

  /**
   * POST /api/v1/fallas/soldadura-inox
   * Crea una nueva falla. El frontend envía el cambiaviaId.
   * El backend hereda contexto geográfico (tramo, curvas, etc.)
   * vía JOIN con cambiavías.
   */
  @Post()
  crear(
    @Body() dto: CrearFallaSoldaduraInoxDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.crear(dto, user);
  }

  /**
   * PATCH /api/v1/fallas/soldadura-inox/:id
   * Actualiza campos. Si cambia cambiaviaId, el contexto se actualiza
   * automáticamente vía FK.
   */
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFallaSoldaduraInoxDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.actualizar(id, dto, user);
  }

  /**
   * DELETE /api/v1/fallas/soldadura-inox/:id
   * Soft delete. El registro se marca eliminado pero se conserva.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.eliminar(id, user);
  }

  /**
   * POST /api/v1/fallas/soldadura-inox/:id/restaurar
   * Restaura un registro eliminado.
   * EXCLUSIVO para ADMINISTRADOR.
   */
  @Post(':id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RolUsuario.ADMINISTRADOR)
  restaurar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.restaurar(id, user);
  }

  // ----------------------------------------------------------
  // IMÁGENES (múltiples por falla)
  // ----------------------------------------------------------

  /**
   * GET /api/v1/fallas/soldadura-inox/:id/imagenes
   * Lista todas las imágenes asociadas a una falla.
   */
  @Get(':id/imagenes')
  listarImagenes(@Param('id', ParseIntPipe) id: number) {
    return this.imagenesService.listarPorFalla(id);
  }

  /**
   * POST /api/v1/fallas/soldadura-inox/:id/imagenes
   * Sube una nueva imagen a la falla.
   *
   * Body: multipart/form-data con campo "archivo".
   *
   * 🔒 Validaciones aplicadas automáticamente:
   *  - Tipo de archivo: solo MIME types en whitelist
   *    (PDF, Word, Excel, imágenes JPG/PNG/WebP)
   *  - Tamaño máximo: 10 MB
   *
   * Una falla puede tener múltiples imágenes (sin límite).
   */
  @Post(':id/imagenes')
  @UseInterceptors(FileInterceptor('archivo'))
  subirImagen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({
            // Regex que matchea cualquier MIME de la whitelist.
            fileType: new RegExp(
              `^(${MIME_TYPES_PERMITIDOS.map((m) =>
                m.replace(/[.+*?^${}()|[\]\\]/g, '\\$&'),
              ).join('|')})$`,
            ),
          }),
        ],
      }),
    )
    archivo: ArchivoMulter,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.imagenesService.subir(id, archivo, user);
  }

  /**
   * DELETE /api/v1/fallas/soldadura-inox/imagenes/:imagenId
   * Elimina una imagen específica (eliminación física).
   */
  @Delete('imagenes/:imagenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminarImagen(
    @Param('imagenId', ParseIntPipe) imagenId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.imagenesService.eliminar(imagenId, user);
  }

  /**
   * GET /api/v1/fallas/soldadura-inox/imagenes/:imagenId/url
   * Devuelve URL firmada temporal para visualizar la imagen.
   */
  @Get('imagenes/:imagenId/url')
  obtenerUrlImagen(@Param('imagenId', ParseIntPipe) imagenId: number) {
    return this.imagenesService.obtenerUrl(imagenId);
  }
}