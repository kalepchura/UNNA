import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolUsuario } from '../enums';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * ============================================================
 * RolesGuard
 * ============================================================
 * Verifica que el usuario autenticado tenga uno de los roles
 * permitidos por el endpoint.
 *
 * Lee la metadata que dejó el decorator @Roles(...).
 *
 * IMPORTANTE: Este guard se ejecuta DESPUÉS de JwtAuthGuard
 * (NestJS ejecuta los guards en el orden en que los pones en
 * @UseGuards). Por eso confiamos en que request.user ya existe.
 *
 * Si el endpoint no tiene @Roles, deja pasar a cualquier
 * usuario autenticado.
 * ============================================================
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    // Reflector es la utilidad de NestJS para LEER metadata
    // que decoradores como @Roles dejaron en el handler.
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Leemos los roles requeridos por el endpoint.
    //    getAllAndOverride busca en: el método primero, luego en la clase.
    //    Esto permite que un controller diga @Roles(USUARIO) y un método
    //    específico lo sobrescriba con @Roles(ADMINISTRADOR).
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. Si el endpoint no declaró roles, cualquier usuario autenticado pasa.
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    // 3. Obtenemos el usuario que JwtAuthGuard pegó en el request
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      // Esto NO debería pasar si JwtAuthGuard corrió antes.
      // Si pasa, es porque alguien olvidó poner JwtAuthGuard.
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 4. Verificamos si el rol del usuario está en la lista permitida
    const tienePermiso = rolesRequeridos.includes(user.rol);

    if (!tienePermiso) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere rol: ${rolesRequeridos.join(' o ')}`,
      );
    }

    return true;
  }
}