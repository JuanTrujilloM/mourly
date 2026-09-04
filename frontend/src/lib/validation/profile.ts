import { z } from 'zod';
import { MIN_PHOTOS } from '@/lib/constants/profile';

const photoSchema = z.object({
  id: z.string(),
  url: z.string(),
  file: z.instanceof(File).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Ingresá tu nombre.'),
  dateOfBirth: z.string().min(1, 'Ingresá tu fecha de nacimiento.'),
  gender: z.string().min(1, 'Elegí tu género.'),
  height: z
    .number({ message: 'Ingresá tu estatura.' })
    .int()
    .min(120, 'Estatura inválida.')
    .max(230, 'Estatura inválida.'),
  photos: z.array(photoSchema).min(MIN_PHOTOS, 'Agregá al menos una foto.'),
  biography: z.string().trim().min(1, 'Escribí una biografía corta.'),
  major: z.string().trim().min(1, 'Ingresá tu carrera.'),
  semester: z.string().min(1, 'Elegí tu semestre.'),
});

export type ProfileValues = z.infer<typeof profileSchema>;
