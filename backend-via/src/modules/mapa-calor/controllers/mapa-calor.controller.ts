import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EsquemaBaseService } from '../services/esquema-base.service';
import { MapaTemperaturaService } from '../services/mapa-temperatura.service';
import { MapaDesgasteService } from '../services/mapa-desgaste.service';
import { MapaFallasService } from '../services/mapa-fallas.service';
import { MapaTemperaturaRequestDto } from '../dto/temperatura/mapa-temperatura-request.dto';
import { MapaDesgasteGeneralRequestDto } from '../dto/desgaste/mapa-desgaste-general-request.dto';
import { MapaDesgasteIndiceRequestDto } from '../dto/desgaste/mapa-desgaste-indice-request.dto';
import { MapaFallasRequestDto } from '../dto/fallas/mapa-fallas-request.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolUsuario } from '../../../common/enums';

@Controller('mapa-calor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class MapaCalorController {
  constructor(
    private readonly esquemaService: EsquemaBaseService,
    private readonly temperaturaService: MapaTemperaturaService,
    private readonly desgasteService: MapaDesgasteService,
    private readonly fallasService: MapaFallasService,
  ) {}

  @Get('esquema-base')
  obtenerEsquemaBase() {
    return this.esquemaService.obtenerEsquemaBase();
  }

  @Post('temperatura')
  @HttpCode(HttpStatus.OK)
  obtenerCapaTemperatura(@Body() request: MapaTemperaturaRequestDto) {
    return this.temperaturaService.calcular(request);
  }

  @Post('desgaste/general')
  @HttpCode(HttpStatus.OK)
  obtenerCapaDesgasteGeneral(@Body() request: MapaDesgasteGeneralRequestDto) {
    return this.desgasteService.calcularModoGeneral(request);
  }

  @Post('desgaste/indice')
  @HttpCode(HttpStatus.OK)
  obtenerCapaDesgasteIndice(@Body() request: MapaDesgasteIndiceRequestDto) {
    return this.desgasteService.calcularModoPorIndice(request);
  }

  /**
   * POST /api/v1/mapa-calor/fallas
   *
   * Capa Fallas, las 4 segmentaciones manejadas internamente
   * via campo `segmentacion` del body.
   *
   * Body opcional. Defaults:
   *   - fechaDesde = hoy - 12 meses
   *   - fechaHasta = hoy
   *   - segmentacion = TRAMO
   */
  @Post('fallas')
  @HttpCode(HttpStatus.OK)
  obtenerCapaFallas(@Body() request: MapaFallasRequestDto) {
    return this.fallasService.calcular(request);
  }
}