import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KpisDesgasteService } from '../services/kpis-desgaste.service';
import { WizardFiltrosService } from '../services/wizard-filtros.service';
import { GraficoG2Service } from '../services/grafico-g2.service';
import { GraficoG1Service } from '../services/grafico-g1.service';
import { GraficoG3Service } from '../services/grafico-g3.service';
import { WizardFiltrosRequestDto } from '../dto/wizard/wizard-filtros-request.dto';
import { GraficoG2RequestDto } from '../dto/graficos/grafico-2/grafico-g2-request.dto';
import { GraficoG1RequestDto } from '../dto/graficos/grafico-1/grafico-g1-request.dto';
import { GraficoG3RequestDto } from '../dto/graficos/grafico-3/grafico-g3-request.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolUsuario } from '../../../common/enums';

@Controller('desgaste')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class DesgasteAnalyticsController {
  constructor(
    private readonly kpisService: KpisDesgasteService,
    private readonly wizardService: WizardFiltrosService,
    private readonly g2Service: GraficoG2Service,
    private readonly g1Service: GraficoG1Service,
    private readonly g3Service: GraficoG3Service,
  ) {}

  @Get('kpis')
  obtenerKpis() {
    return this.kpisService.calcularTodos();
  }

  @Post('wizard-filtros')
  @HttpCode(HttpStatus.OK)
  obtenerOpcionesWizard(@Body() request: WizardFiltrosRequestDto) {
    return this.wizardService.obtenerOpciones(request);
  }

  @Post('graficos/2')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico2(@Body() request: GraficoG2RequestDto) {
    return this.g2Service.calcular(request);
  }

  @Post('graficos/1')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico1(@Body() request: GraficoG1RequestDto) {
    return this.g1Service.calcular(request);
  }

  @Post('graficos/3')
  @HttpCode(HttpStatus.OK)
  obtenerGrafico3(@Body() request: GraficoG3RequestDto) {
    return this.g3Service.calcular(request);
  }
}