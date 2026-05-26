import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';

import type { Request } from 'express';

import { UsuariosService } from '../services/usuarios.service';

import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { FiltrarUsuariosDto } from '../dto/filtrar-usuarios.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

import { RolUsuario } from '../../../common/enums';

/**
 * ============================================================
 * UsuariosController
 * ============================================================
 * Gestión de usuarios del sistema.
 *
 * SOLO ADMINISTRADORES.
 * ============================================================
 */
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
export class UsuariosController {
  constructor(
    private readonly service: UsuariosService,
  ) {}

  // ==========================================================
  // LISTAR
  // ==========================================================

  @Get()
  listar(@Query() filtros: FiltrarUsuariosDto) {
    return this.service.listar(filtros);
  }

  @Get('filtro')
  listarParaFiltro() {
    return this.service.listarParaFiltro();
  }

  // ==========================================================
  // OBTENER
  // ==========================================================

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.service.obtenerPorId(id);
  }

  // ==========================================================
  // CREAR
  // ==========================================================

  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.service.crear(dto);
  }

  // ==========================================================
  // ACTUALIZAR
  // ==========================================================

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  // ==========================================================
  // DESACTIVAR
  // ==========================================================

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  desactivar(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const authUser = (req as any).user;

    return this.service.desactivar(
      id,
      authUser.id,
    );
  }

  // ==========================================================
  // ACTIVAR
  // ==========================================================

  @Patch(':id/activar')
  @HttpCode(HttpStatus.NO_CONTENT)
  activar(@Param('id') id: string) {
    return this.service.activar(id);
  }

  // ==========================================================
  // REENVIAR INVITACIÓN
  // ==========================================================

  @Post(':id/reenviar-invitacion')
  @HttpCode(HttpStatus.NO_CONTENT)
  reenviarInvitacion(
    @Param('id') id: string,
  ) {
    return this.service.reenviarInvitacion(id);
  }
}