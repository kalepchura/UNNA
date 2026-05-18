import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from '../services/auditoria.service';
import { EliminadosResumenService } from '../services/eliminados-resumen.service';
import { FiltrarAuditoriaDto } from '../dto/filtrar-auditoria.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolUsuario } from '../../../common/enums';

/**
 * Endpoints de la página de Auditoría.
 * EXCLUSIVO PARA ADMINISTRADOR.
 */
@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
export class AuditoriaController {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly eliminadosResumenService: EliminadosResumenService,
  ) {}

  /**
   * GET /api/v1/auditoria
   * Pestaña 1: Historial de operaciones.
   */
  @Get()
  listar(@Query() filtros: FiltrarAuditoriaDto) {
    return this.auditoriaService.listar(filtros);
  }

  /**
   * GET /api/v1/auditoria/eliminados/resumen
   * Pestaña 2 (header): conteos de eliminados por entidad.
   *
   * Devuelve algo como:
   *   {
   *     entidades: [
   *       { codigo: 'fallas-riel', nombre: 'Fallas en Riel', total: 5 },
   *       { codigo: 'fallas-soldadura-inox', nombre: '...', total: 2 }
   *     ],
   *     totalGeneral: 7,
   *     calculadoEn: '2026-05-04T...'
   *   }
   */
  @Get('eliminados/resumen')
  obtenerResumenEliminados() {
    return this.eliminadosResumenService.obtenerResumen();
  }
}