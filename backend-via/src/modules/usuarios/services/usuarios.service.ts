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
 *
 * Flujo correcto:
 *
 * 1. Admin crea usuario
 * 2. Supabase crea cuenta automáticamente
 * 3. Supabase envía email de invitación
 * 4. Usuario abre link
 * 5. Front detecta sesión recovery
 * 6. Usuario crea contraseña
 * 7. Usuario inicia sesión normalmente
 *
 * ============================================================
 */

@Injectable()
export class UsuariosService {
  constructor(
    private readonly usuariosRepo: UsuariosRepository,

    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
  ) {}

  // ==========================================================
  // HELPERS PRIVADOS
  // ==========================================================

  private async buscarOFallar(
    id: string,
  ): Promise<UsuarioApp> {
    const usuario =
      await this.usuariosRepo.buscarPorId(id);

    if (!usuario) {
      throw new NotFoundException(
        `Usuario ${id} no encontrado`,
      );
    }

    return usuario;
  }

  private async obtenerInvitacionPendiente(
    supabaseUserId: string,
  ): Promise<boolean> {
    try {
      const { data, error } =
        await this.supabaseAdmin.auth.admin.getUserById(
          supabaseUserId,
        );

      if (error || !data.user) {
        return false;
      }

      console.log('SUPABASE USER:', {
        email: data.user.email,
        email_confirmed_at:
          data.user.email_confirmed_at,
        invited_at: data.user.invited_at,
        confirmation_sent_at:
          data.user.confirmation_sent_at,
        last_sign_in_at:
          data.user.last_sign_in_at,
      });

      /**
       * Si nunca inició sesión,
       * todavía está pendiente.
       */
      return !data.user.last_sign_in_at;

    } catch {
      return false;
    }
  }

  private async enriquecerConInvitacion(
    usuarios: UsuarioApp[],
  ): Promise<UsuarioResponseDto[]> {
    return Promise.all(
      usuarios.map(async (usuario) => {
        const pendiente =
          await this.obtenerInvitacionPendiente(
            usuario.id,
          );

        return UsuarioResponseDto.fromEntity(
          usuario,
          pendiente,
        );
      }),
    );
  }

  // ==========================================================
  // LECTURA
  // ==========================================================

  async listar(filtros: FiltrarUsuariosDto) {
    const [usuarios, total] =
      await this.usuariosRepo.listar(
        filtros,
      );

    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    const data =
      await this.enriquecerConInvitacion(
        usuarios,
      );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  async obtenerPorId(
    id: string,
  ): Promise<UsuarioResponseDto> {
    const usuario =
      await this.buscarOFallar(id);

    const pendiente =
      await this.obtenerInvitacionPendiente(
        usuario.id,
      );

    return UsuarioResponseDto.fromEntity(
      usuario,
      pendiente,
    );
  }

  async listarParaFiltro() {
    return this.usuariosRepo.listarParaFiltro();
  }

  // ==========================================================
  // CREAR USUARIO
  // ==========================================================

  async crear(
    dto: CrearUsuarioDto,
  ): Promise<UsuarioResponseDto> {

    // --------------------------------------------------------
    // 1. Validar duplicado
    // --------------------------------------------------------

    const existente =
      await this.usuariosRepo.buscarPorCorreo(
        dto.correo,
      );

    if (existente) {
      throw new ConflictException(
        `Ya existe un usuario con correo ${dto.correo}`,
      );
    }

    // --------------------------------------------------------
    // 2. Crear usuario + enviar invitación
    // --------------------------------------------------------

    /**
     * IMPORTANTE:
     *
     * NO usar createUser()
     *
     * inviteUserByEmail()
     * ya crea el usuario automáticamente
     * y genera correctamente el recovery link.
     */

    const { data, error } =
      await this.supabaseAdmin.auth.admin
        .inviteUserByEmail(
          dto.correo,
          {
            redirectTo:
              `${process.env.FRONTEND_URL}/reset-password`,

            data: {
              nombre: dto.nombre,
            },
          },
        );

    if (error || !data.user) {
      throw new InternalServerErrorException(
        `No se pudo invitar usuario: ${
          error?.message || 'sin detalle'
        }`,
      );
    }

    const supabaseUserId =
      data.user.id;

    // --------------------------------------------------------
    // 3. Guardar en BD propia
    // --------------------------------------------------------

    try {
      const creado =
        await this.usuariosRepo.crear({
          id: supabaseUserId,

          nombre: dto.nombre,

          correo: dto.correo,

          rol: dto.rol,

          activo: true,
        });

      return UsuarioResponseDto.fromEntity(
        creado,
        true,
      );

    } catch {

      // rollback Supabase

      await this.supabaseAdmin.auth.admin
        .deleteUser(supabaseUserId)
        .catch(() => {});

      throw new InternalServerErrorException(
        'No se pudo guardar usuario en BD local',
      );
    }
  }

  // ==========================================================
  // ACTUALIZAR
  // ==========================================================

  async actualizar(
    id: string,
    dto: ActualizarUsuarioDto,
  ): Promise<UsuarioResponseDto> {

    const usuario =
      await this.buscarOFallar(id);

    const seraUsuario =
      dto.rol !== undefined &&
      dto.rol !==
        RolUsuario.ADMINISTRADOR;

    const seraInactivo =
      dto.activo === false;

    const esAdminActivo =
      usuario.rol ===
        RolUsuario.ADMINISTRADOR &&
      usuario.activo;

    if (
      esAdminActivo &&
      (seraUsuario || seraInactivo)
    ) {
      const totalAdmins =
        await this.usuariosRepo.contarAdministradoresActivos();

      if (totalAdmins <= 1) {
        throw new BadRequestException(
          'No se puede modificar este usuario: dejaría al sistema sin administradores activos',
        );
      }
    }

    const actualizado =
      await this.usuariosRepo.actualizar(
        usuario,
        {
          nombre:
            dto.nombre ??
            usuario.nombre,

          rol:
            dto.rol ??
            usuario.rol,

          activo:
            dto.activo ??
            usuario.activo,
        },
      );

    const pendiente =
      await this.obtenerInvitacionPendiente(
        actualizado.id,
      );

    return UsuarioResponseDto.fromEntity(
      actualizado,
      pendiente,
    );
  }

  // ==========================================================
  // DESACTIVAR
  // ==========================================================

  async desactivar(
  id: string,
  usuarioAutenticadoId: string,
): Promise<void> {
  const usuario =
    await this.buscarOFallar(id);

  // Ya está desactivado
  if (!usuario.activo) {
    return;
  }

  // ========================================
  // EVITAR AUTO-DESACTIVACIÓN
  // ========================================

  if (usuario.id === usuarioAutenticadoId) {
    throw new BadRequestException(
      'No puedes desactivar tu propia cuenta',
    );
  }

  // ========================================
  // EVITAR QUEDARSE SIN ADMINS
  // ========================================

  if (
    usuario.rol === RolUsuario.ADMINISTRADOR &&
    (await this.usuariosRepo.contarAdministradoresActivos()) <= 1
  ) {
    throw new BadRequestException(
      'No se puede desactivar al último administrador activo',
    );
  }

  await this.usuariosRepo.actualizar(
    usuario,
    {
      activo: false,
    },
  );
}

  // ==========================================================
  // REENVIAR INVITACIÓN
  // ==========================================================

  async reenviarInvitacion(
    id: string,
  ): Promise<void> {

    const usuario =
      await this.buscarOFallar(id);

    const pendiente =
      await this.obtenerInvitacionPendiente(
        id,
      );

    if (!pendiente) {
      throw new BadRequestException(
        'Este usuario ya confirmó su cuenta. No es necesario reenviar la invitación.',
      );
    }

    const { error } =
      await this.supabaseAdmin.auth.admin
        .inviteUserByEmail(
          usuario.correo,
          {
            redirectTo:
              `${process.env.FRONTEND_URL}/reset-password`,
          },
        );

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo reenviar la invitación: ${error.message}`,
      );
    }
  }
  // ==========================================================
// ACTIVAR
// ==========================================================

async activar(id: string): Promise<void> {
  const usuario =
    await this.buscarOFallar(id);

  // Ya está activo
  if (usuario.activo) {
    return;
  }

  await this.usuariosRepo.actualizar(
    usuario,
    {
      activo: true,
    },
  );
}
}