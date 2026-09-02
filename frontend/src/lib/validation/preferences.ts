import { z } from 'zod';

export const preferencesSchema = z.object({
  ageRange: z
    .object({ min: z.number(), max: z.number() })
    .refine((range) => range.min < range.max, {
      message: 'El rango de edad no es válido.',
    }),
  hobbies: z.array(z.string()),
  relationshipType: z
    .string()
    .min(1, 'Selecciona qué tipo de relación buscas.'),
  orientation: z.string().min(1, 'Selecciona tu orientación.'),
  genderInterest: z.string().min(1, 'Selecciona qué género te interesa.'),
  sameUniversity: z.boolean({
    message: 'Indica tu preferencia de universidad.',
  }),
  heightRange: z.string().min(1, 'Selecciona tu preferencia de estatura.'),
  energyVibe: z.array(z.string()),
});

export type PreferencesValues = z.infer<typeof preferencesSchema>;
