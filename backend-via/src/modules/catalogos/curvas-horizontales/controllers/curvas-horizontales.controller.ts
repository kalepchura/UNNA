import { Controller, Get, Param, Query, ParseIntPipe, UseGuards  } from '@nestjs/common';
import { CurvasHorizontalesService } from '../services/curvas-horizontales.service';
import { FiltrarCurvasHorizontalesDto } from '../dto/filtrar-curvas-horizontales.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';


@Controller('curvas-horizontales')
@UseGuards(JwtAuthGuard) 
export class CurvasHorizontalesController {
  constructor(private readonly service: CurvasHorizontalesService) {}

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