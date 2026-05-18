import {
  Controller, Get, Post, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { KpisFallasService } from '../services/kpis-fallas.service';
import { Grafico1FallasService } from '../services/grafico-1-fallas.service';
import { Grafico2FallasService } from '../services/grafico-2-fallas.service';
import { Grafico3FallasService } from '../services/grafico-3-fallas.service';
import { Grafico1RequestDto } from '../dto/graficos/grafico-1/grafico-1-request.dto';
import { Grafico2RequestDto } from '../dto/graficos/grafico-2/grafico-2-request.dto';
import { Grafico3RequestDto } from '../dto/graficos/grafico-3/grafico-3-request.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolUsuario } from '../../../common/enums';

@Controller('fallas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class FallasAnalyticsController {
  constructor(
    private readonly kpisService: KpisFallasService,
    private readonly grafico1Service: Grafico1FallasService,
    private readonly grafico2Service: Grafico2FallasService,
    private readonly grafico3Service: Grafico3FallasService,
  ) {}

  @Get('kpis')
  obtenerKpis() {
    return this.kpisService.calcularTodos();
  }

  /** Gráfico 1 — Evolución temporal por tramo. */
  @Post('graficos/1')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico1(@Body() request: Grafico1RequestDto) {
    return this.grafico1Service.calcular(request);
  }

  /** Gráfico 2 — Distribución por categoría. */
  @Post('graficos/2')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico2(@Body() request: Grafico2RequestDto) {
    return this.grafico2Service.calcular(request);
  }

  /**
   * POST /api/v1/fallas/graficos/3
   * Gráfico 3 — Fallas por velocidad.
   *
   * Eje X = velocidades del catálogo (siempre todas, en ascendente).
   * Si apilarPorTipo=false → 1 serie "Total".
   * Si apilarPorTipo=true  → 2 series "Riel" y "Soldadura".
   */
  @Post('graficos/3')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico3(@Body() request: Grafico3RequestDto) {
    return this.grafico3Service.calcular(request);
  }
}