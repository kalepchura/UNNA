import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TramosService } from '../services/tramos.service';
import { FiltrarTramosDto } from '../dto/filtrar-tramos.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

/**
 * ============================================================
 * TramosController
 * ============================================================
 * Expone los endpoints REST del catálogo Tramos.
 *
 * Solo lectura: el catálogo es inmutable desde la API.
 * (La carga inicial se hace por seed, no por HTTP.)
 *
 * Acceso: cualquier usuario autenticado (USUARIO o ADMINISTRADOR)
 * puede consultar el catálogo. Por eso usamos solo JwtAuthGuard
 * y NO añadimos @Roles().
 * ============================================================
 */
@Controller('tramos')
@UseGuards(JwtAuthGuard)  
export class TramosController {
  constructor(private readonly tramosService: TramosService) {}

   @Get('tabla')
  listarParaTabla(@Query() filtros: FiltrarTramosDto) {
    return this.tramosService.listarParaTabla(filtros);
  }

   @Get('selector')
  listarParaSelector() {
    return this.tramosService.listarParaSelector();
  }

  
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.tramosService.obtenerPorId(id);
  }
}