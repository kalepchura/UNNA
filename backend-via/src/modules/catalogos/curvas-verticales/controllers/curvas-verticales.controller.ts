import { Controller, Get, Param, Query, ParseIntPipe, UseGuards  } from '@nestjs/common';
import { CurvasVerticalesService } from '../services/curvas-verticales.service';
import { FiltrarCurvasVerticalesDto } from '../dto/filtrar-curvas-verticales.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';


@Controller('curvas-verticales')
@UseGuards(JwtAuthGuard) 
export class CurvasVerticalesController {
  constructor(private readonly service: CurvasVerticalesService) {}

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