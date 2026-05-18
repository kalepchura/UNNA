import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EscenariosMtbService } from '../services/escenarios-mtb.service';
import { ValoresMtbService } from '../services/valores-mtb.service';
import { CrearEscenarioMtbDto } from '../dto/escenario-mtb/crear-escenario-mtb.dto';
import { ActualizarEscenarioMtbDto } from '../dto/escenario-mtb/actualizar-escenario-mtb.dto';
import { FiltrarEscenariosMtbDto } from '../dto/escenario-mtb/filtrar-escenarios-mtb.dto';
import { GuardarValoresMtbDto } from '../dto/mtb-escenario/guardar-valores-mtb.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { RolUsuario } from '../../../common/enums';

@Controller('desgaste/escenarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class EscenariosMtbController {
  constructor(
    private readonly service: EscenariosMtbService,
    private readonly valoresService: ValoresMtbService,
  ) {}

  // -- CRUD escenario (de 3.19) --

  @Post('buscar')
  @HttpCode(HttpStatus.OK)
  listar(@Body() filtros: FiltrarEscenariosMtbDto) {
    return this.service.listar(filtros);
  }

  @Post('eliminados')
  @HttpCode(HttpStatus.OK)
  @Roles(RolUsuario.ADMINISTRADOR)
  listarEliminados(@Body() filtros: FiltrarEscenariosMtbDto) {
    return this.service.listarEliminados(filtros);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  @Post()
  crear(
    @Body() dto: CrearEscenarioMtbDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.crear(dto, user);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEscenarioMtbDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.actualizar(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.eliminar(id, user);
  }

  @Post(':id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RolUsuario.ADMINISTRADOR)
  restaurar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.restaurar(id, user);
  }

  // -- VALORES ANUALES MTB (nuevo en 3.20) --

  /**
   * GET /api/v1/desgaste/escenarios/:id/valores
   *
   * Devuelve la lista de valores anuales con MTB acumulado calculado.
   * Funciona también para escenarios eliminados (admin podría querer
   * revisarlos desde auditoría).
   */
  @Get(':id/valores')
  listarValores(@Param('id', ParseIntPipe) id: number) {
    return this.valoresService.listarValoresPorEscenario(id);
  }

  /**
   * POST /api/v1/desgaste/escenarios/:id/valores/guardar
   *
   * Aplica un batch de cambios:
   *  - mtb número → upsert
   *  - mtb null   → delete
   *
   * Auditoría: 1 BULK_LOAD asociado al escenario padre.
   * NO se permite si el escenario está eliminado.
   */
  @Post(':id/valores/guardar')
  @HttpCode(HttpStatus.OK)
  guardarValores(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GuardarValoresMtbDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.valoresService.guardarCambios(id, dto, user);
  }
}