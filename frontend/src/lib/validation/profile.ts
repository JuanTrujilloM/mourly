import { z } from 'zod';
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MIN_PHOTOS,
} from '@/lib/constants/profile';

const newFiles = (photos: { file?: File }[]) =>
  photos.flatMap((photo) => (photo.file ? [photo.file] : []));

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
  // Refined on the array, not per photo, so the message lands on
  // errors.photos where PhotosCard renders it.
  photos: z
    .array(photoSchema)
    .min(MIN_PHOTOS, 'Agregá al menos una foto.')
    .refine(
      (photos) =>
        newFiles(photos).every((file) => ALLOWED_PHOTO_TYPES.includes(file.type)),
      'Solo se permiten fotos JPG o PNG.',
    )
    .refine(
      (photos) => newFiles(photos).every((file) => file.size <= MAX_PHOTO_BYTES),
      'Cada foto puede pesar máximo 5 MB.',
    ),
  biography: z.string().trim().min(1, 'Escribí una biografía corta.'),
  major: z.string().trim().min(1, 'Ingresá tu carrera.'),
  semester: z.string().min(1, 'Elegí tu semestre.'),
});

export type ProfileValues = z.infer<typeof profileSchema>;
