import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioApp } from '../entities/usuario-app.entity';
import { FiltrarUsuariosDto } from '../dto/filtrar-usuarios.dto';
import { RolUsuario } from '../../../common/enums';

@Injectable()
export class UsuariosRepository {
  constructor(
    @InjectRepository(UsuarioApp)
    private readonly repo: Repository<UsuarioApp>,
  ) {}

  async listar(f: FiltrarUsuariosDto): Promise<[UsuarioApp[], number]> {
    const { correo, nombre, rol, activo, page = 1, limit = 20 } = f;
    const q = this.repo.createQueryBuilder('u');

    if (correo) q.andWhere('u.correo ILIKE :c', { c: `%${correo}%` });
    if (nombre) q.andWhere('u.nombre ILIKE :n', { n: `%${nombre}%` });
    if (rol) q.andWhere('u.rol = :r', { r: rol });
    if (activo !== undefined) q.andWhere('u.activo = :a', { a: activo });

    q.orderBy('u.creado_en', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return q.getManyAndCount();
  }

  async buscarPorId(id: string): Promise<UsuarioApp | null> {
    return this.repo.findOne({ where: { id } });
  }

  async buscarPorCorreo(correo: string): Promise<UsuarioApp | null> {
    return this.repo.findOne({ where: { correo } });
  }

  /**
   * Cuenta cuántos administradores activos hay.
   * Lo necesita el service para impedir borrar/desactivar al último admin
   * (regla de negocio del informe sección 10.2.3).
   */
  async contarAdministradoresActivos(): Promise<number> {
    return this.repo.count({
      where: { rol: RolUsuario.ADMINISTRADOR, activo: true },
    });
  }

  /** Crea un usuario en usuarios_app. El UUID viene de Supabase Auth. */
  async crear(datos: Partial<UsuarioApp>): Promise<UsuarioApp> {
    return this.repo.save(this.repo.create(datos));
  }

  async actualizar(usuario: UsuarioApp, cambios: Partial<UsuarioApp>): Promise<UsuarioApp> {
    Object.assign(usuario, cambios);
    return this.repo.save(usuario);
  }

  async eliminar(usuario: UsuarioApp): Promise<void> {
    await this.repo.remove(usuario);
  }

  /** Lista resumida para autocomplete del filtro de auditoría. */
  async listarParaFiltro() {
    return this.repo.createQueryBuilder('u')
      .select(['u.id', 'u.nombre', 'u.correo'])
      .orderBy('u.nombre', 'ASC')
      .getMany();
  }
}