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

import { FallasRielAccionService } from '../services/fallas-riel-accion.service';
import { CrearAccionRielDto } from '../dto/accion-riel/crear-accion-riel.dto';
import { ActualizarAccionRielDto } from '../dto/accion-riel/actualizar-accion-riel.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { RolUsuario } from '../../../common/enums';

/**
 * ============================================================
 * FallasRielAccionController
 * ============================================================
 * Endpoints CRUD para acciones de mantenimiento (historial)
 * de una FallaRiel.
 *
 * Las rutas son ANIDADAS bajo la falla padre cuando aplica:
 *  - GET    /api/v1/fallas/riel/:fallaId/acciones
 *  - POST   /api/v1/fallas/riel/:fallaId/acciones
 *
 * Las rutas que operan sobre una acción individual son planas
 * (no llevan fallaId en URL) porque el id de la acción ya
 * identifica unívocamente:
 *  - GET    /api/v1/fallas/riel/acciones/:id
 *  - PATCH  /api/v1/fallas/riel/acciones/:id
 *  - DELETE /api/v1/fallas/riel/acciones/:id
 *  - POST   /api/v1/fallas/riel/acciones/:id/restaurar
 *
 * Acceso: USUARIO y ADMINISTRADOR pueden hacer todo el CRUD.
 * Solo ADMINISTRADOR puede restaurar acciones eliminadas.
 *
 * 🔒 SEGURIDAD:
 *  - JWT + RolesGuard a nivel de controller
 *  - ParseIntPipe valida IDs numéricos
 *  - class-validator en los DTOs valida enums y formatos
 * ============================================================
 */
@Controller('fallas/riel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.USUARIO, RolUsuario.ADMINISTRADOR)
export class FallasRielAccionController {
  constructor(private readonly service: FallasRielAccionService) {}

  // ----------------------------------------------------------
  // LISTADO POR FALLA (timeline)
  // ----------------------------------------------------------

  /**
   * GET /api/v1/fallas/riel/:fallaId/acciones
   * Lista el timeline cronológico (asc) de acciones de una falla.
   * Solo acciones activas (eliminadas se filtran).
   */
  @Get(':fallaId/acciones')
  listarPorFalla(@Param('fallaId', ParseIntPipe) fallaId: number) {
    return this.service.listarPorFalla(fallaId, false);
  }

  /**
   * GET /api/v1/fallas/riel/:fallaId/acciones/eliminadas
   * Timeline incluyendo acciones eliminadas (para auditoría admin).
   */
  @Get(':fallaId/acciones/eliminadas')
  @Roles(RolUsuario.ADMINISTRADOR)
  listarConEliminadas(@Param('fallaId', ParseIntPipe) fallaId: number) {
    return this.service.listarPorFalla(fallaId, true);
  }

  // ----------------------------------------------------------
  // CRUD DE ACCIONES
  // ----------------------------------------------------------

  /**
   * POST /api/v1/fallas/riel/:fallaId/acciones
   * Crea una nueva acción para la falla. Sincroniza estado desnormalizado.
   */
  @Post(':fallaId/acciones')
  crear(
    @Param('fallaId', ParseIntPipe) fallaId: number,
    @Body() dto: CrearAccionRielDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.crear(fallaId, dto, user);
  }

  /**
   * GET /api/v1/fallas/riel/acciones/:id
   * Detalle de una acción individual.
   */
  @Get('acciones/:id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  /**
   * PATCH /api/v1/fallas/riel/acciones/:id
   * Edita una acción. Sincroniza estado de la falla padre.
   */
  @Patch('acciones/:id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarAccionRielDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.actualizar(id, dto, user);
  }

  /**
   * DELETE /api/v1/fallas/riel/acciones/:id
   * Soft delete. Si era la acción más reciente, el estado de la
   * falla padre se recalcula automáticamente.
   */
  @Delete('acciones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.eliminar(id, user);
  }

  /**
   * POST /api/v1/fallas/riel/acciones/:id/restaurar
   * Restaura una acción eliminada. EXCLUSIVO ADMINISTRADOR.
   */
  @Post('acciones/:id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RolUsuario.ADMINISTRADOR)
  restaurar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.restaurar(id, user);
  }
}