import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CambiaviasService } from '../services/cambiavias.service';
import { FiltrarCambiaviasDto } from '../dto/filtrar-cambiavias.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';


@Controller('cambiavias')
@UseGuards(JwtAuthGuard) 
export class CambiaviasController {
  constructor(private readonly service: CambiaviasService) {}

  @Get('tabla')
  listarParaTabla(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 1000;
    return this.service.listarParaTabla(limitNum);
  }

  @Get('selector')
  listarParaSelector() {
    return this.service.listarParaSelector();
  }

   @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }
}