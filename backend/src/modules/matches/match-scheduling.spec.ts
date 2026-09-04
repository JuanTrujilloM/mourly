import {
  bothCompleted,
  commonVenueId,
  earliestCommonSlot,
  isActiveStatus,
  venueById,
} from './match-scheduling';
import type { LoadedMatch } from './match-loader.service';

function slot(userId: string, day: string, timeSlot: string) {
  return { userId, date: new Date(`${day}T00:00:00Z`), timeSlot };
}

function venueOption(
  venueId: string,
  userASelected: boolean,
  userBSelected: boolean,
  name = 'Pergamino',
  address = 'Cra 37',
) {
  return {
    venueId,
    userASelected,
    userBSelected,
    venue: { name, address },
  };
}

function buildMatch(overrides: Partial<LoadedMatch> = {}): LoadedMatch {
  return {
    id: 'm1',
    userAId: 'a',
    userBId: 'b',
    status: 'pending',
    scheduleAttempts: 0,
    date: null,
    availabilities: [],
    venueOptions: [],
    userA: { id: 'a', email: 'a@eafit.edu.co', cellphone: '+1', profile: null },
    userB: { id: 'b', email: 'b@ces.edu.co', cellphone: '+2', profile: null },
    ...overrides,
  };
}

describe('match scheduling rules', () => {
  describe('isActiveStatus', () => {
    it('treats pending and confirmed as active', () => {
      expect(isActiveStatus('pending')).toBe(true);
      expect(isActiveStatus('confirmed')).toBe(true);
    });

    it('treats every other status as closed', () => {
      expect(isActiveStatus('expired')).toBe(false);
      expect(isActiveStatus('rejected')).toBe(false);
    });
  });

  describe('bothCompleted', () => {
    it('is false until both users submitted availability', () => {
      const match = buildMatch({
        availabilities: [slot('a', '2026-07-10', '12:00')],
        venueOptions: [
          venueOption('v1', true, true),
          venueOption('v2', true, true),
        ],
      });

      expect(bothCompleted(match)).toBe(false);
    });

    it('is false until both users picked the minimum venues', () => {
      const match = buildMatch({
        availabilities: [
          slot('a', '2026-07-10', '12:00'),
          slot('b', '2026-07-10', '12:00'),
        ],
        venueOptions: [venueOption('v1', true, true)],
      });

      expect(bothCompleted(match)).toBe(false);
    });

    it('is true once availability and venues are in for both', () => {
      const match = buildMatch({
        availabilities: [
          slot('a', '2026-07-10', '12:00'),
          slot('b', '2026-07-10', '12:00'),
        ],
        venueOptions: [
          venueOption('v1', true, true),
          venueOption('v2', true, true),
        ],
      });

      expect(bothCompleted(match)).toBe(true);
    });
  });

  describe('earliestCommonSlot', () => {
    it('returns null when the two calendars never overlap', () => {
      const match = buildMatch({
        availabilities: [
          slot('a', '2026-07-10', '12:00'),
          slot('b', '2026-07-11', '15:00'),
        ],
      });

      expect(earliestCommonSlot(match)).toBeNull();
    });

    it('picks the earliest slot both users offered', () => {
      const match = buildMatch({
        availabilities: [
          slot('a', '2026-07-12', '15:00'),
          slot('a', '2026-07-10', '18:00'),
          slot('b', '2026-07-12', '15:00'),
          slot('b', '2026-07-10', '18:00'),
        ],
      });

      const common = earliestCommonSlot(match);

      expect(common?.label).toBe('vie 10 jul · 18:00');
    });

    it('converts a Colombian local hour into the right UTC instant', () => {
      const match = buildMatch({
        availabilities: [
          slot('a', '2026-07-10', '12:00'),
          slot('b', '2026-07-10', '12:00'),
        ],
      });

      expect(earliestCommonSlot(match)?.scheduledAt.toISOString()).toBe(
        '2026-07-10T17:00:00.000Z',
      );
    });
  });

  describe('commonVenueId', () => {
    it('finds the venue both users selected', () => {
      const match = buildMatch({
        venueOptions: [
          venueOption('v1', true, false),
          venueOption('v2', true, true),
        ],
      });

      expect(commonVenueId(match)).toBe('v2');
    });

    it('returns null when there is no shared venue', () => {
      const match = buildMatch({
        venueOptions: [venueOption('v1', true, false)],
      });

      expect(commonVenueId(match)).toBeNull();
    });
  });

  describe('venueById', () => {
    it('returns the stored name and address', () => {
      const match = buildMatch({
        venueOptions: [venueOption('v1', true, true, 'Velvet', 'Cra 33')],
      });

      expect(venueById(match, 'v1')).toEqual({
        name: 'Velvet',
        address: 'Cra 33',
      });
    });

    it('falls back to a generic label for an unknown venue', () => {
      expect(venueById(buildMatch(), 'ghost')).toEqual({
        name: 'el lugar acordado',
        address: '',
      });
    });
  });
});
