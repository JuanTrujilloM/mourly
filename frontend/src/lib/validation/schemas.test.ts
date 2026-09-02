import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema, verifySchema } from './auth';
import { profileSchema } from './profile';
import { preferencesSchema } from './preferences';
import { venueSchema } from './venue';

const VALID_PROFILE = {
  name: 'Ana',
  dateOfBirth: '2003-04-12',
  gender: 'Femenino',
  height: 166,
  photos: [{ id: '1', url: 'blob:1' }],
  biography: 'Cine y café',
  major: 'Derecho',
  semester: '6',
};

const VALID_PREFERENCES = {
  ageRange: { min: 20, max: 28 },
  hobbies: ['Cine', 'Café', 'Correr'],
  relationshipType: 'Seria',
  orientation: 'Heterosexual',
  genderInterest: 'Hombres',
  sameUniversity: false,
  heightRange: 'Indiferente',
  energyVibe: ['Tranquilo/a'],
};

const VALID_VENUE = {
  name: 'Pergamino',
  type: 'Café',
  address: 'Cra 37',
  openingHours: '8-20',
  description: 'Bonito',
  commissionRate: 0.1,
  averageSpentPerPerson: 30000,
  tags: ['café'],
  active: true,
};

describe('registerSchema', () => {
  it('accepts a well formed signup', () => {
    expect(
      registerSchema.safeParse({
        email: 'ana@eafit.edu.co',
        cellphone: '+573001112233',
      }).success,
    ).toBe(true);
  });

  it('rejects a malformed email', () => {
    expect(
      registerSchema.safeParse({ email: 'nope', cellphone: '+573001112233' })
        .success,
    ).toBe(false);
  });

  it('leaves the supported-domain rule to the backend', () => {
    expect(
      registerSchema.safeParse({
        email: 'ana@gmail.com',
        cellphone: '+573001112233',
      }).success,
    ).toBe(true);
  });

  it('rejects a non Colombian mobile', () => {
    expect(
      registerSchema.safeParse({
        email: 'ana@eafit.edu.co',
        cellphone: '12345',
      }).success,
    ).toBe(false);
  });

  it('accepts a mobile without the country prefix', () => {
    expect(
      registerSchema.safeParse({
        email: 'ana@eafit.edu.co',
        cellphone: '3001112233',
      }).success,
    ).toBe(true);
  });
});

describe('verifySchema', () => {
  it('requires exactly six digits', () => {
    expect(verifySchema.safeParse({ code: '123456' }).success).toBe(true);
    expect(verifySchema.safeParse({ code: '12345' }).success).toBe(false);
    expect(verifySchema.safeParse({ code: 'abcdef' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('reuses the register email rule', () => {
    expect(loginSchema.safeParse({ email: 'ana@eafit.edu.co' }).success).toBe(
      true,
    );
    expect(loginSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts a complete profile', () => {
    expect(profileSchema.safeParse(VALID_PROFILE).success).toBe(true);
  });

  it('requires at least one photo', () => {
    expect(
      profileSchema.safeParse({ ...VALID_PROFILE, photos: [] }).success,
    ).toBe(false);
  });

  it('rejects an out of range height', () => {
    expect(
      profileSchema.safeParse({ ...VALID_PROFILE, height: 90 }).success,
    ).toBe(false);
  });

  it('requires a gender selection without re-encoding the vocabulary', () => {
    expect(profileSchema.safeParse({ ...VALID_PROFILE, gender: '' }).success).toBe(
      false,
    );
    expect(
      profileSchema.safeParse({ ...VALID_PROFILE, gender: 'Cualquiera' }).success,
    ).toBe(true);
  });

  it('rejects a blank name', () => {
    expect(
      profileSchema.safeParse({ ...VALID_PROFILE, name: '   ' }).success,
    ).toBe(false);
  });
});

describe('preferencesSchema', () => {
  it('accepts complete preferences', () => {
    expect(preferencesSchema.safeParse(VALID_PREFERENCES).success).toBe(true);
  });

  it('rejects an inverted age range', () => {
    expect(
      preferencesSchema.safeParse({
        ...VALID_PREFERENCES,
        ageRange: { min: 30, max: 25 },
      }).success,
    ).toBe(false);
  });

  it('rejects an age range with equal bounds', () => {
    expect(
      preferencesSchema.safeParse({
        ...VALID_PREFERENCES,
        ageRange: { min: 25, max: 25 },
      }).success,
    ).toBe(false);
  });

  it('requires a relationship selection', () => {
    expect(
      preferencesSchema.safeParse({
        ...VALID_PREFERENCES,
        relationshipType: '',
      }).success,
    ).toBe(false);
  });
});

describe('venueSchema', () => {
  it('accepts a complete venue', () => {
    expect(venueSchema.safeParse(VALID_VENUE).success).toBe(true);
  });

  it('keeps the commission a fraction between 0 and 1', () => {
    expect(
      venueSchema.safeParse({ ...VALID_VENUE, commissionRate: 1.5 }).success,
    ).toBe(false);
  });

  it('rejects a negative average spend', () => {
    expect(
      venueSchema.safeParse({ ...VALID_VENUE, averageSpentPerPerson: -1 })
        .success,
    ).toBe(false);
  });
});
