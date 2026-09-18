import { z } from 'zod';

const COLOMBIAN_MOBILE = /^(\+?57)?3\d{9}$/;

export const emailEntrySchema = z.object({
  email: z.email('Ingresá un correo institucional válido.'),
});

export const cellphoneSchema = z.object({
  cellphone: z
    .string()
    .trim()
    .regex(COLOMBIAN_MOBILE, 'Ingresá un celular colombiano válido.'),
});

export const contactSchema = emailEntrySchema.extend(cellphoneSchema.shape);

export const verifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'El código tiene 6 dígitos.'),
});

export const waitlistSchema = contactSchema.extend({
  name: z.string().trim().min(2, 'Ingresá tu nombre.').max(80, 'Nombre muy largo.'),
});

export type EmailEntryValues = z.infer<typeof emailEntrySchema>;
export type CellphoneValues = z.infer<typeof cellphoneSchema>;
export type VerifyValues = z.infer<typeof verifySchema>;
export type WaitlistValues = z.infer<typeof waitlistSchema>;
