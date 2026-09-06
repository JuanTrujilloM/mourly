import { z } from 'zod';
const COLOMBIAN_MOBILE = /^(\+?57)?3\d{9}$/;

export const registerSchema = z.object({
  email: z.email('Ingresá un correo institucional válido.'),
  cellphone: z
    .string()
    .trim()
    .regex(COLOMBIAN_MOBILE, 'Ingresá un celular colombiano válido.'),
});

export const verifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'El código tiene 6 dígitos.'),
});

export const waitlistSchema = registerSchema.extend({
  name: z.string().trim().min(2, 'Ingresá tu nombre.').max(80, 'Nombre muy largo.'),
});

export const loginSchema = z.object({
  email: registerSchema.shape.email,
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type VerifyValues = z.infer<typeof verifySchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type WaitlistValues = z.infer<typeof waitlistSchema>;
