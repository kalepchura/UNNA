import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * ============================================================
 * @CurrentUser()
 * ============================================================
 * Extrae el usuario autenticado del request y lo inyecta como
 * parámetro del controller.
 *
 * Funciona porque el JwtAuthGuard pega el usuario en
 * request.user antes de llegar al controller.
 *
 * Uso:
 *   @Post()
 *   crear(
 *     @Body() dto: CrearFallaDto,
 *     @CurrentUser() user: AuthenticatedUser,  // ← aquí
 *   ) {
 *     // user.id, user.rol, user.nombre disponibles
 *     return this.service.crear(dto, user);
 *   }
 * ============================================================
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    // Obtenemos el objeto request de Express
    const request = ctx.switchToHttp().getRequest();
    // Devolvemos lo que el JwtAuthGuard guardó en request.user
    return request.user;
  },
);