import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UsuariosRepository } from '../repositories/usuarios.repository';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { FiltrarUsuariosDto } from '../dto/filtrar-usuarios.dto';
import { UsuarioResponseDto } from '../dto/usuario-response.dto';
import { UsuarioApp } from '../entities/usuario-app.entity';
import { RolUsuario } from '../../../common/enums';
import { SUPABASE_ADMIN_CLIENT } from '../usuarios.tokens';

/**
 * ============================================================
 * UsuariosService
 * ============================================================
 * Lógica de negocio del módulo Usuarios.
 *
 * Operaciones especiales:
 *  - crear: invoca supabase.auth.admin.createUser() + persiste en usuarios_app
 *  - eliminar: invoca supabase.auth.admin.deleteUser() + remove en usuarios_app
 *  - actualizar: solo modifica usuarios_app (no toca Supabase Auth, salvo desactivar)
 *
 * Reglas de negocio (informe sección 10.2.3):
 *  - Siempre debe existir al menos UN administrador activo
 *  - No se puede eliminar/desactivar al último admin
 * ============================================================
 */
@Injectable()
export class UsuariosService {
  constructor(
    private readonly usuariosRepo: UsuariosRepository,
    // Cliente Supabase con SERVICE_ROLE_KEY (poderes de admin).
    // Lo inyectamos vía un token custom (ver usuarios.tokens.ts).
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
  ) {}

  // ----------------------------------------------------------
  // LECTURA
  // ----------------------------------------------------------

  async listar(filtros: FiltrarUsuariosDto) {
    const [usuarios, total] = await this.usuariosRepo.listar(filtros);
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;
    return {
      data: usuarios.map((u) => UsuarioResponseDto.fromEntity(u)),
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerPorId(id: string): Promise<UsuarioResponseDto> {
    const u = await this.buscarOFallar(id);
    return UsuarioResponseDto.fromEntity(u);
  }

  async listarParaFiltro() {
    return this.usuariosRepo.listarParaFiltro();
  }

  // ----------------------------------------------------------
  // CREAR
  // ----------------------------------------------------------

  /**
   * Crea un usuario nuevo.
   * Pasos:
   *   1. Verifica que el correo no exista en usuarios_app.
   *   2. Invoca supabase.auth.admin.createUser() → genera UUID y guarda credenciales.
   *   3. Persiste en usuarios_app con el mismo UUID.
   *
   * Si paso 3 falla, hacemos compensación: borramos el usuario de Supabase Auth
   * para evitar quedar en estado inconsistente.
   */
  async crear(dto: CrearUsuarioDto): Promise<UsuarioResponseDto> {
    // 1. Validar duplicado en usuarios_app
    const existente = await this.usuariosRepo.buscarPorCorreo(dto.correo);
    if (existente) {
      throw new ConflictException(`Ya existe un usuario con correo ${dto.correo}`);
    }

    // 2. Crear en Supabase Auth
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: dto.correo,
      password: dto.password,
      email_confirm: true, // confirma el email automáticamente (no enviamos correo)
      user_metadata: { nombre: dto.nombre },
    });

    if (error || !data.user) {
      throw new InternalServerErrorException(
        `Error al crear usuario en Supabase Auth: ${error?.message || 'sin detalle'}`,
      );
    }

    const supabaseUserId = data.user.id;

    // 3. Persistir en usuarios_app
    try {
      const creado = await this.usuariosRepo.crear({
        id: supabaseUserId,
        nombre: dto.nombre,
        correo: dto.correo,
        rol: dto.rol,
        activo: true,
      });
      return UsuarioResponseDto.fromEntity(creado);
    } catch (err) {
      // Compensación: borrar de Supabase si falló persistir en BD
      await this.supabaseAdmin.auth.admin.deleteUser(supabaseUserId).catch(() => {
        // best-effort: si no se pudo borrar, no bloqueamos el flujo del error
      });
      throw new InternalServerErrorException(
        'No se pudo persistir el usuario en la base de datos. Operación revertida.',
      );
    }
  }

  // ----------------------------------------------------------
  // ACTUALIZAR
  // ----------------------------------------------------------

  /**
   * Actualiza nombre, rol o activo.
   * Antes de aplicar valida la regla del último administrador.
   */
    async actualizar(id: string, dto: ActualizarUsuarioDto): Promise<UsuarioResponseDto> {
    const usuario = await this.buscarOFallar(id);

    // Validación: si el cambio dejaría al sistema sin administradores activos
    const seraUsuario = dto.rol !== undefined && dto.rol !== RolUsuario.ADMINISTRADOR;
    const seraInactivo = dto.activo === false;
    const esAdminActivo =
        usuario.rol === RolUsuario.ADMINISTRADOR && usuario.activo;

    if (esAdminActivo && (seraUsuario || seraInactivo)) {
        const totalAdmins = await this.usuariosRepo.contarAdministradoresActivos();
        if (totalAdmins <= 1) {
        throw new BadRequestException(
            'No se puede modificar este usuario: dejaría al sistema sin administradores activos',
        );
        }
    }

    const actualizado = await this.usuariosRepo.actualizar(usuario, {
        nombre: dto.nombre ?? usuario.nombre,
        rol: dto.rol ?? usuario.rol,
        activo: dto.activo ?? usuario.activo,
    });

    return UsuarioResponseDto.fromEntity(actualizado);
    }
  // ----------------------------------------------------------
  // ELIMINAR
  // ----------------------------------------------------------

  /**
   * Eliminación lógica: pone activo = false.
   * NO borramos físicamente para preservar trazabilidad en auditoría.
   * (Informe sección 10.2.2.)
   */
  async desactivar(id: string): Promise<void> {
    const usuario = await this.buscarOFallar(id);

    if (!usuario.activo) return; // ya está desactivado, idempotente

    if (
      usuario.rol === RolUsuario.ADMINISTRADOR &&
      (await this.usuariosRepo.contarAdministradoresActivos()) <= 1
    ) {
      throw new BadRequestException(
        'No se puede desactivar al último administrador activo',
      );
    }

    await this.usuariosRepo.actualizar(usuario, { activo: false });
  }

  // ----------------------------------------------------------
  // RESET DE CONTRASEÑA
  // ----------------------------------------------------------

  /**
   * Genera y envía email de recuperación a través de Supabase Auth.
   */
  async enviarResetPassword(id: string): Promise<void> {
    const usuario = await this.buscarOFallar(id);

    const { error } = await this.supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: usuario.correo,
    });

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo generar email de recuperación: ${error.message}`,
      );
    }
  }

  // ----------------------------------------------------------
  // HELPERS PRIVADOS
  // ----------------------------------------------------------

  private async buscarOFallar(id: string): Promise<UsuarioApp> {
    const u = await this.usuariosRepo.buscarPorId(id);
    if (!u) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return u;
  }
}