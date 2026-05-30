import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { FallasRielImportacionService } from '../services/fallas-riel-importacion.service';
import { ImportacionFallasRielResultadoDto } from '../dto/falla-riel/importacion-fallas-riel-resultado.dto';

/**
 * ============================================================
 * FallasRielImportacionController
 * ============================================================
 * Endpoint para importación masiva de fallas riel desde Excel.
 *
 * POST /fallas/riel/importar
 *   - Recibe un archivo Excel (.xlsx o .xls) como multipart/form-data
 *   - Campo del archivo: "archivo"
 *   - Devuelve un resumen con detecciones creadas, acciones creadas y errores
 *
 * Registrar en fallas.module.ts:
 *   controllers: [..., FallasRielImportacionController]
 *   providers:   [..., FallasRielImportacionService]
 * ============================================================
 */
@Controller('fallas/riel')
@UseGuards(JwtAuthGuard)
export class FallasRielImportacionController {
  constructor(
    private readonly importacionService: FallasRielImportacionService,
  ) {}

  /**
   * POST /fallas/riel/importar
   *
   * Body: multipart/form-data
   *   archivo: File (.xlsx | .xls)
   */
  @Post('importar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB máximo
      },
      fileFilter: (_req, file, cb) => {
        const extensionesPermitidas = ['.xlsx', '.xls'];
        const ext = file.originalname
          .toLowerCase()
          .slice(file.originalname.lastIndexOf('.'));
        if (extensionesPermitidas.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Formato no soportado: "${ext}". Solo se permiten archivos .xlsx o .xls`,
            ),
            false,
          );
        }
      },
    }),
  )
  async importar(
    @UploadedFile() archivo: { buffer: Buffer; originalname: string; size: number },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ImportacionFallasRielResultadoDto> {
    if (!archivo) {
      throw new BadRequestException(
        'Debe adjuntar un archivo Excel (.xlsx o .xls) en el campo "archivo".',
      );
    }

    return this.importacionService.importar(archivo.buffer, user);
  }
}