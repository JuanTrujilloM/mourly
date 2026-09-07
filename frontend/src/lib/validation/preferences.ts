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
    .min(1, 'Elegí qué tipo de relación buscás.'),
  genderInterests: z
    .array(z.string())
    .min(1, 'Elegí al menos un género que te interese.'),
  sameUniversity: z.boolean({
    message: 'Indicá tu preferencia de universidad.',
  }),
  heightRange: z.string().min(1, 'Elegí tu preferencia de estatura.'),
  energyVibe: z.array(z.string()),
});

export type PreferencesValues = z.infer<typeof preferencesSchema>;
