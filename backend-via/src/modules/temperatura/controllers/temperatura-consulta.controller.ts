import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TemperaturaConsultaService } from '../services/temperatura-consulta.service';
import { FiltrarImportacionesDto } from '../dto/filtrar-importaciones.dto';
import { FiltrarTemperaturasDto } from '../dto/filtrar-temperaturas.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolUsuario } from '../../../common/enums';

/**
 * Endpoints de CONSULTA de importaciones.
 * Acceso: USUARIO y ADMINISTRADOR.
 */
@Controller('temperatura/importaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class TemperaturaConsultaController {
  constructor(private readonly service: TemperaturaConsultaService) {}

  /**
   * POST /api/v1/temperatura/importaciones/buscar
   * Lista importaciones con filtros (POST por la complejidad de filtros).
   */
  @Post('buscar')
  @HttpCode(HttpStatus.OK)
  listar(@Body() filtros: FiltrarImportacionesDto) {
    return this.service.listar(filtros);
  }

  /**
   * GET /api/v1/temperatura/importaciones/:id
   * Detalle de una importación.
   */
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  /**
   * POST /api/v1/temperatura/importaciones/:id/registros
   * Filas individuales de la importación, paginadas.
   */
  @Post(':id/registros')
  @HttpCode(HttpStatus.OK)
  listarRegistros(
    @Param('id', ParseIntPipe) id: number,
    @Body() filtros: FiltrarTemperaturasDto,
  ) {
    return this.service.listarRegistrosDeImportacion(id, filtros);
  }

  /**
   * GET /api/v1/temperatura/importaciones/:id/archivo/url
   * URL firmada temporal para descargar el archivo original.
   */
  @Get(':id/archivo/url')
  obtenerUrlArchivo(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerUrlArchivo(id);
  }
}