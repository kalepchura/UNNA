import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagenFalla } from '../entities/imagen-falla.entity';

@Injectable()
export class ImagenesFallaRepository {
  constructor(
    @InjectRepository(ImagenFalla)
    private readonly repo: Repository<ImagenFalla>,
  ) {}

  /** Lista todas las imágenes de una falla, ordenadas por fecha. */
  async listarPorFalla(fallaId: number): Promise<ImagenFalla[]> {
    return this.repo.find({
      where: { fallaId },
      order: { creadoEn: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<ImagenFalla | null> {
    return this.repo.findOne({ where: { id } });
  }

  async crear(datos: Partial<ImagenFalla>): Promise<ImagenFalla> {
    return this.repo.save(this.repo.create(datos));
  }

  /** Elimina FÍSICAMENTE el registro (no hay soft delete en imágenes). */
  async eliminar(imagen: ImagenFalla): Promise<void> {
    await this.repo.remove(imagen);
  }
}