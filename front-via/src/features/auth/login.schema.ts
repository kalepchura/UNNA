import { z } from 'zod';

/**
 * Schema de validación del formulario de login.
 * Zod = librería de validación type-safe.
 * Define forma + validación + tipo TS auto-generado.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});

export type LoginFormData = z.infer<typeof loginSchema>;