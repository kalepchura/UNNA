import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { UsuariosRepository } from '../../modules/usuarios/repositories/usuarios.repository';
import { SUPABASE_ADMIN_CLIENT } from '../../modules/usuarios/usuarios.tokens';

interface CacheEntry {
  user: AuthenticatedUser;
  expira: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 60_000;
  private readonly CLEANUP_INTERVAL_MS = 5 * 60_000;

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
    private readonly usuariosRepo: UsuariosRepository,
  ) {
    setInterval(() => this.limpiarCacheExpirado(), this.CLEANUP_INTERVAL_MS);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('No se envió token de autenticación');
    }

    const cached = this.cache.get(token);
    if (cached && cached.expira > Date.now()) {
      request.user = cached.user;
      return true;
    }

    const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const usuario = await this.usuariosRepo.buscarPorId(user.id);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no registrado en el sistema');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    const authenticatedUser: AuthenticatedUser = {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };

    this.cache.set(token, {
      user: authenticatedUser,
      expira: Date.now() + this.CACHE_TTL_MS,
    });

    request.user = authenticatedUser;
    return true;
  }

  private extraerToken(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;
    const [tipo, token] = authHeader.split(' ');
    if (tipo !== 'Bearer' || !token) return null;
    return token;
  }

  private limpiarCacheExpirado(): void {
    const ahora = Date.now();
    for (const [token, entry] of this.cache.entries()) {
      if (entry.expira <= ahora) {
        this.cache.delete(token);
      }
    }
  }
}