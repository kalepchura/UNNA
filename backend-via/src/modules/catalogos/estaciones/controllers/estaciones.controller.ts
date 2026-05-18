import { Controller, Get, Param, Query, ParseIntPipe, UseGuards  } from '@nestjs/common';
import { EstacionesService } from '../services/estaciones.service';
import { FiltrarEstacionesDto } from '../dto/filtrar-estaciones.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@Controller('estaciones')
@UseGuards(JwtAuthGuard)
export class EstacionesController {
  constructor(private readonly estacionesService: EstacionesService) {}

  @Get('tabla')
  listarParaTabla(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 1000;
    return this.estacionesService.listarParaTabla(limitNum);
  }

  @Get('selector')
  listarParaSelector() {
    return this.estacionesService.listarParaSelector();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.estacionesService.obtenerPorId(id);
  }
}