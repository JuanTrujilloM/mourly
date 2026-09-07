export const RELATIONSHIP_TYPES = [
  'Casual',
  'Seria',
  'Amistad',
  'Casual abierto a seria',
  'Seria abierta a casual',
  'Abierto a todo',
] as const;

export const GENDER_INTERESTS = ['Hombres', 'Mujeres', 'No binario'] as const;

export const HEIGHT_RANGES = [
  'Indiferente',
  'Más baja',
  'Similar',
  'Más alta',
] as const;

export const AGE_MIN = 18;
export const AGE_MAX = 40;
export const MIN_HOBBIES = 3;
export const MIN_VIBES = 1;
export const MIN_GENDER_INTERESTS = 1;

export const DEFAULT_HOBBY_CATEGORY = 'general';
