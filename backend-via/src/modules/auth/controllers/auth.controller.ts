import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * GET /api/v1/auth/me
   *
   * El frontend lo invoca después del login para obtener el perfil
   * completo (incluyendo el rol) y construir el menú según rol.
   *
   * Requiere: Authorization: Bearer <token>
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  perfil(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.obtenerPerfil(user.id);
  }
}