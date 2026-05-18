export interface FiltrosUsuarios {
  correo?: string;
  nombre?: string;
  rol?: 'USUARIO' | 'ADMINISTRADOR';
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: 'USUARIO' | 'ADMINISTRADOR';
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearUsuarioDto {
  correo: string;
  nombre: string;
  password: string;
  rol: 'USUARIO' | 'ADMINISTRADOR';
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  rol?: 'USUARIO' | 'ADMINISTRADOR';
  activo?: boolean;
}