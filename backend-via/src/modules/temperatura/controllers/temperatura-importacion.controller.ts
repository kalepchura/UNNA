import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemperaturaImportacionService } from '../services/temperatura-importacion.service';
import { ImportarTemperaturaDto } from '../dto/importar-temperatura.dto';
import { FiltrarImportacionesDto } from '../dto/filtrar-importaciones.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { RolUsuario } from '../../../common/enums';
import { TEMPERATURA_ARCHIVO } from '../../../common/constants/temperatura.constants';
import type { ArchivoMulter } from 'src/common/services/storage.service';

/**
 * Endpoints de IMPORTACIÓN, eliminación y restauración.
 */
@Controller('temperatura/importaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class TemperaturaImportacionController {
  constructor(private readonly service: TemperaturaImportacionService) {}

  // ----------------------------------------------------------
  // IMPORTAR
  // ----------------------------------------------------------

  /**
   * POST /api/v1/temperatura/importaciones
   * Sube un archivo y lo procesa. Multipart con campo "archivo".
   */
  @Post()
  @UseInterceptors(FileInterceptor('archivo'))
  importar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: TEMPERATURA_ARCHIVO.MAX_BYTES,
            message: (max) =>
              `El archivo excede el tamaño máximo permitido (${Math.round(max / 1024 / 1024)} MB)`,
          }),
        ],
      }),
    )
    archivo: ArchivoMulter,
    @Body() dto: ImportarTemperaturaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.importar(archivo, dto, user);
  }

  // ----------------------------------------------------------
  // ELIMINAR (soft delete)
  // ----------------------------------------------------------

  /**
   * DELETE /api/v1/temperatura/importaciones/:id
   * Soft delete. USUARIO o ADMINISTRADOR pueden eliminar.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.eliminar(id, user);
  }

  // ----------------------------------------------------------
  // RESTAURAR (admin)
  // ----------------------------------------------------------

  /**
   * POST /api/v1/temperatura/importaciones/:id/restaurar
   * Restaura una importación eliminada. Solo ADMINISTRADOR.
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
  // LISTAR ELIMINADAS (admin)
  // ----------------------------------------------------------

  /**
   * POST /api/v1/temperatura/importaciones/eliminados
   * Lista solo importaciones eliminadas. Solo ADMINISTRADOR.
   */
  @Post('eliminados')
  @HttpCode(HttpStatus.OK)
  @Roles(RolUsuario.ADMINISTRADOR)
  listarEliminadas(@Body() filtros: FiltrarImportacionesDto) {
    return this.service.listarEliminadas(filtros);
  }
}