import {
  Controller, Get, Post, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { KpisTemperaturaService } from '../services/kpis-temperatura.service';
import { GraficoG1TempService } from '../services/grafico-g1-temp.service';
import { GraficoG2TempService } from '../services/grafico-g2-temp.service';
import { GraficoG3TempService } from '../services/grafico-g3-temp.service';
import { GraficoG1TempRequestDto } from '../dto/graficos/grafico-1/grafico-1-temp-request.dto';
import { GraficoG2TempRequestDto } from '../dto/graficos/grafico-2/grafico-2-temp-request.dto';
import { GraficoG3TempRequestDto } from '../dto/graficos/grafico-3/grafico-3-temp-request.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolUsuario } from '../../../common/enums';

@Controller('temperatura')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class TemperaturaAnalyticsController {
  constructor(
    private readonly kpisService: KpisTemperaturaService,
    private readonly graficoG1Service: GraficoG1TempService,
    private readonly graficoG2Service: GraficoG2TempService,
    private readonly graficoG3Service: GraficoG3TempService,
  ) {}

  @Get('kpis')
  obtenerKpis() {
    return this.kpisService.calcularTodos();
  }

  /** G1 — Serie temporal por tramo. */
  @Post('graficos/1')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico1(@Body() request: GraficoG1TempRequestDto) {
    return this.graficoG1Service.calcular(request);
  }

  /** G2 — Comparación entre tramos. */
  @Post('graficos/2')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico2(@Body() request: GraficoG2TempRequestDto) {
    return this.graficoG2Service.calcular(request);
  }

  /**
   * POST /api/v1/temperatura/graficos/3
   * G3 — Patrón horario.
   *
   * Eje X: 24 horas del día (00:00 a 23:00, fijas).
   * Cada punto = MIN/AVG/MAX para esa hora en todo el rango
   * [fechaDesde, fechaHasta].
   *
   * Defaults:
   *   - tramoCodigos: 3 primeros del catálogo
   *   - rango: últimos 30 días
   *   - tipoValor: AVG
   */
  @Post('graficos/3')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico3(@Body() request: GraficoG3TempRequestDto) {
    return this.graficoG3Service.calcular(request);
  }
}