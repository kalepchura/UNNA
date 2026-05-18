// velocidades.controller.ts
import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VelocidadesService } from '../services/velocidades.service';
import { FiltrarVelocidadesDto } from '../dto/filtrar-velocidades.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@Controller('velocidades')
@UseGuards(JwtAuthGuard)
export class VelocidadesController {
  constructor(private readonly service: VelocidadesService) {}

  @Get('tabla')
  listarParaTabla(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 1000;
    return this.service.listarParaTabla(limitNum);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  @Get('filtro')
  listarParaFiltro() {
    return this.service.listarParaFiltro();
  }
}