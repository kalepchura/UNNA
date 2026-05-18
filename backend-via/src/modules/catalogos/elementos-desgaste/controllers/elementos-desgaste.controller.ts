import { Controller, Get, Param, Query, ParseIntPipe, UseGuards  } from '@nestjs/common';
import { ElementosDesgasteService } from '../services/elementos-desgaste.service';
import { FiltrarElementosDesgasteDto } from '../dto/filtrar-elementos-desgaste.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@Controller('elementos-desgaste')
@UseGuards(JwtAuthGuard)
export class ElementosDesgasteController {
  constructor(private readonly service: ElementosDesgasteService) {}

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