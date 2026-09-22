import { type LoadedMatch } from './match-loader.service';

export function slot(userId: string, day: string, timeSlot: string) {
  return { userId, date: new Date(`${day}T00:00:00Z`), timeSlot };
}

export function completedMatch(
  overrides: Partial<LoadedMatch> = {},
): LoadedMatch {
  return {
    id: 'm1',
    userAId: 'a',
    userBId: 'b',
    status: 'pending',
    scheduleAttempts: 0,
    date: null,
    availabilities: [
      slot('a', '2026-07-10', '15:00'),
      slot('b', '2026-07-10', '15:00'),
    ],
    venueOptions: [
      {
        venueId: 'v1',
        userASelected: true,
        userBSelected: true,
        venue: { name: 'Pergamino', address: 'Cra 37' },
      },
      {
        venueId: 'v2',
        userASelected: true,
        userBSelected: true,
        venue: { name: 'Velvet', address: 'Cra 33' },
      },
    ],
    userA: {
      id: 'a',
      email: 'a@eafit.edu.co',
      cellphone: '+1',
      profile: { name: 'Ana' },
    },
    userB: {
      id: 'b',
      email: 'b@ces.edu.co',
      cellphone: '+2',
      profile: { name: 'Beto' },
    },
    ...overrides,
  };
}
