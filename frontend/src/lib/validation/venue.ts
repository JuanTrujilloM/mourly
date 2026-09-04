import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  type: z.string().min(1, 'Elegí un tipo.'),
  address: z.string().min(1, 'La dirección es obligatoria.'),
  openingHours: z.string().min(1, 'El horario es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  commissionRate: z
    .number({ message: 'Ingresá la comisión.' })
    .min(0, 'Mínimo 0.')
    .max(1, 'La comisión es una fracción entre 0 y 1.'),
  averageSpentPerPerson: z
    .number({ message: 'Ingresá el gasto promedio.' })
    .min(0, 'Mínimo 0.'),
  tags: z.array(z.string()),
  active: z.boolean(),
});

export type VenueValues = z.infer<typeof venueSchema>;
