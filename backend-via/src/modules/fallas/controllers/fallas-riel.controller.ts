import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ParseEnumPipe,
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

import { FallasRielService } from '../services/fallas-riel.service';
import { CrearFallaRielDto } from '../dto/falla-riel/crear-falla-riel.dto';
import { ActualizarFallaRielDto } from '../dto/falla-riel/actualizar-falla-riel.dto';
import { FiltrarFallasRielDto } from '../dto/falla-riel/filtrar-fallas-riel.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { RolUsuario, TipoArchivoFalla } from '../../../common/enums';

import type { ArchivoMulter } from '../../../common/services/storage.service';
import {
  MAX_FILE_SIZE_BYTES,
  MIME_TYPES_PERMITIDOS,
} from '../../../common/services/storage.service';

/**
 * ============================================================
 * FallasRielController
 * ============================================================
 * Endpoints CRUD + archivos para FallaRiel.
 *
 * Acceso: USUARIO y ADMINISTRADOR pueden hacer todo el CRUD.
 * Solo ADMINISTRADOR puede:
 *  - Restaurar registros eliminados
 *  - Listar registros eliminados (página de auditoría)
 *
 * 🔒 SEGURIDAD:
 *  - JWT + RolesGuard a nivel de controller
 *  - Validación de tipo de archivo (MIME) en uploads
 *  - Validación de tamaño máximo (10 MB) en uploads
 *  - ParseEnumPipe valida el tipo de archivo (interno/externo)
 * ============================================================
 */
@Controller('fallas/riel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class FallasRielController {
  constructor(private readonly service: FallasRielService) {}

  // ----------------------------------------------------------
  // LISTADO Y BÚSQUEDA
  // ----------------------------------------------------------

  /**
   * POST /api/v1/fallas/riel/buscar
   * Lista paginada con filtros. Solo registros activos.
   */
  @Post('buscar')
  @HttpCode(HttpStatus.OK)
  listar(@Body() filtros: FiltrarFallasRielDto) {
    return this.service.listar(filtros);
  }

  /**
   * POST /api/v1/fallas/riel/eliminados
   * Lista paginada de registros soft-deleted.
   * EXCLUSIVO para ADMINISTRADOR (página de auditoría).
   */
  @Post('eliminados')
  @HttpCode(HttpStatus.OK)
  @Roles(RolUsuario.ADMINISTRADOR)
  listarEliminados(@Body() filtros: FiltrarFallasRielDto) {
    return this.service.listarEliminados(filtros);
  }

  /**
   * GET /api/v1/fallas/riel/:id
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
   * POST /api/v1/fallas/riel
   * Crea una nueva falla. El backend calcula tramo/curvas/velocidad
   * automáticamente desde (progresiva, via).
   */
  @Post()
  crear(
    @Body() dto: CrearFallaRielDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.crear(dto, user);
  }

  /**
   * PATCH /api/v1/fallas/riel/:id
   * Actualiza campos. Si cambia progresiva o via, recalcula contexto.
   */
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFallaRielDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.actualizar(id, dto, user);
  }

  /**
   * DELETE /api/v1/fallas/riel/:id
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
   * POST /api/v1/fallas/riel/:id/restaurar
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
  // ARCHIVOS (informe interno / externo)
  // ----------------------------------------------------------

  /**
   * POST /api/v1/fallas/riel/:id/archivo/:tipo
   * Sube un archivo (interno o externo) a la falla.
   *
   * Body: multipart/form-data con campo "archivo".
   *
   * 🔒 Validaciones aplicadas automáticamente:
   *  - Tipo de archivo: solo MIME types en whitelist (PDF, Word, Excel, imágenes)
   *  - Tamaño máximo: 10 MB
   *  - Param `tipo`: solo 'interno' o 'externo' (ParseEnumPipe)
   */
  @Post(':id/archivo/:tipo')
  @UseInterceptors(FileInterceptor('archivo'))
  adjuntarArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Param('tipo', new ParseEnumPipe(TipoArchivoFalla))
    tipo: TipoArchivoFalla,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({
            // Regex que matchea cualquier MIME de la whitelist.
            // Escapamos caracteres especiales por seguridad.
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
    return this.service.adjuntarArchivo(id, tipo, archivo, user);
  }

  /**
   * DELETE /api/v1/fallas/riel/:id/archivo/:tipo
   * Elimina el archivo de la falla.
   */
  @Delete(':id/archivo/:tipo')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminarArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Param('tipo', new ParseEnumPipe(TipoArchivoFalla))
    tipo: TipoArchivoFalla,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.eliminarArchivo(id, tipo, user);
  }

  /**
   * GET /api/v1/fallas/riel/:id/archivo/:tipo/url
   * Devuelve URL firmada temporal para descargar el archivo.
   */
  @Get(':id/archivo/:tipo/url')
  obtenerUrlArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Param('tipo', new ParseEnumPipe(TipoArchivoFalla))
    tipo: TipoArchivoFalla,
  ) {
    return this.service.obtenerUrlArchivo(id, tipo);
  }
}