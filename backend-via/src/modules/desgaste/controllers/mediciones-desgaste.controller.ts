import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MedicionesDesgasteService } from '../services/mediciones-desgaste.service';
import { CargarGrillaDto } from '../dto/grilla/cargar-grilla.dto';
import { GuardarCambiosDto } from '../dto/grilla/guardar-cambios.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { RolUsuario } from '../../../common/enums';

/**
 * Endpoints de la página "Carga de mediciones" (informe 9.3.2 #2).
 */
@Controller('desgaste/mediciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class MedicionesDesgasteController {
  constructor(private readonly service: MedicionesDesgasteService) {}

  /**
   * POST /api/v1/desgaste/mediciones/grilla
   *
   * Devuelve la grilla completa para que el frontend la pinte.
   * Body opcional con filtros (años, tramos).
   *
   * Es POST (no GET) por dos razones:
   *  - El body puede tener listas largas de años / tramos
   *  - Consistente con el resto de endpoints de filtros del proyecto
   */
  @Post('grilla')
  @HttpCode(HttpStatus.OK)
  cargarGrilla(@Body() filtros: CargarGrillaDto) {
    return this.service.cargarGrilla(filtros);
  }

  /**
   * POST /api/v1/desgaste/mediciones/guardar
   *
   * Aplica las celdas modificadas en una sola operación atómica.
   * Auditoría: 1 BULK_LOAD log con cantidad de celdas modificadas.
   */
  @Post('guardar')
  @HttpCode(HttpStatus.OK)
  guardarCambios(
    @Body() dto: GuardarCambiosDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.guardarCambios(dto, user);
  }
}