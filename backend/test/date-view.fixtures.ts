const hobbies = (...names: string[]) =>
  names.map((name) => ({ hobby: { name } }));

export function dateViewLink(overrides: Record<string, unknown> = {}) {
  return {
    id: 'link-1',
    matchId: 'm1',
    userId: 'a',
    step: 'DATE',
    consumedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    ...overrides,
  };
}

export function dateMatch(overrides: Record<string, unknown> = {}) {
  return {
    userAId: 'a',
    userA: {
      profile: {
        name: 'Ana',
        dateOfBirth: new Date('2003-05-01T00:00:00Z'),
        university: 'EAFIT',
        major: 'Diseño',
        biography: 'Corre y toma café.',
        photos: [{ url: 'https://cdn/a.jpg', isPrimary: true }],
        hobbies: hobbies('Café de especialidad', 'Running'),
      },
    },
    userB: {
      profile: {
        name: 'Beto',
        dateOfBirth: new Date('2002-03-10T00:00:00Z'),
        university: 'CES',
        major: 'Medicina',
        biography: 'Fotografía y montaña.',
        photos: [{ url: 'https://cdn/b.jpg', isPrimary: true }],
        hobbies: hobbies('Café de especialidad', 'Montaña'),
      },
    },
    date: {
      scheduledAt: new Date('2026-07-10T20:00:00Z'),
      venue: { name: 'Pergamino', address: 'Cra 37' },
    },
    ...overrides,
  };
}
