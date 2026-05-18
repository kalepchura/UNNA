import { Velocidad } from '../entities/velocidad.entity';

export class VelocidadResponseDto {
  id!: number;
  progresivaInicio!: number;
  progresivaFin!: number;
  velocidadKmh!: number;

  static fromEntity(v: Velocidad): VelocidadResponseDto {
    const dto = new VelocidadResponseDto();
    Object.assign(dto, v);
    return dto;
  }
}