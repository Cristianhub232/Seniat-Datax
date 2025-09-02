import { z } from 'zod';

/**
 * Esquema para validar la creación de un usuario usando nombre de rol
 */
export const createUserSchema = z.object({
    username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.string().min(1, 'Debe especificar un rol válido'),
});

/**
 * Esquema para validar la actualización de un usuario.
 * Todos los campos son opcionales y usan el nombre de rol en lugar de role_id.
 */

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended'], {
    error: 'El campo status debe ser active, inactive o suspended',
  }),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

