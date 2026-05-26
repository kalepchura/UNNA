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

  /**
   * TTL del cache: 30s (antes era 60s).
   *
   * BUG PREVENIDO: Con 60s, un usuario recién desactivado
   * seguía pasando el guard durante hasta 1 minuto.
   * 30s es un balance razonable entre rendimiento y frescura.
   *
   * Alternativa más segura: reducir a 0 para deshabilitar cache
   * si la consistencia inmediata es crítica en tu sistema.
   */
  private readonly CACHE_TTL_MS = 30_000;
  private readonly CLEANUP_INTERVAL_MS = 5 * 60_000;

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
    private readonly usuariosRepo: UsuariosRepository,
  ) {
    setInterval(
      () => this.limpiarCacheExpirado(),
      this.CLEANUP_INTERVAL_MS,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'No se envió token de autenticación',
      );
    }

    // --------------------------------------------------------
    // Cache hit — solo si no está expirado
    // --------------------------------------------------------
    const cached = this.cache.get(token);
    if (cached && cached.expira > Date.now()) {
      request.user = cached.user;
      return true;
    }

    // --------------------------------------------------------
    // Verificar token con Supabase
    // --------------------------------------------------------
    const {
      data: { user },
      error,
    } = await this.supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Token inválido o expirado — limpiar cache por si acaso
      this.cache.delete(token);
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // --------------------------------------------------------
    // Verificar usuario en BD propia
    //
    // BUG PREVENIDO: Antes se guardaba en cache ANTES de
    // verificar activo/existencia. Ahora:
    // - Si no existe → eliminar del cache + 401
    // - Si inactivo  → eliminar del cache + 401
    //   (evita que un token cacheado de usuario activo
    //    siga siendo válido después de desactivarlo)
    // --------------------------------------------------------
    const usuario = await this.usuariosRepo.buscarPorId(user.id);

    if (!usuario) {
      this.cache.delete(token);
      throw new UnauthorizedException(
        'Usuario no registrado en el sistema',
      );
    }

    if (!usuario.activo) {
      this.cache.delete(token);
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    // --------------------------------------------------------
    // Todo OK — guardar en cache y adjuntar al request
    // --------------------------------------------------------
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