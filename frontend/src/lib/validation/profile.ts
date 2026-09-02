import { z } from 'zod';
import { MIN_PHOTOS } from '@/lib/constants/profile';

const photoSchema = z.object({
  id: z.string(),
  url: z.string(),
  file: z.instanceof(File).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa tu nombre.'),
  dateOfBirth: z.string().min(1, 'Ingresa tu fecha de nacimiento.'),
  gender: z.string().min(1, 'Selecciona tu género.'),
  height: z
    .number({ message: 'Ingresa tu estatura.' })
    .int()
    .min(120, 'Estatura inválida.')
    .max(230, 'Estatura inválida.'),
  photos: z.array(photoSchema).min(MIN_PHOTOS, 'Agrega al menos una foto.'),
  biography: z.string().trim().min(1, 'Escribe una breve biografía.'),
  major: z.string().trim().min(1, 'Ingresa tu carrera.'),
  semester: z.string().min(1, 'Selecciona tu semestre.'),
});

export type ProfileValues = z.infer<typeof profileSchema>;
