import { availabilityFor, intersection, partnerSummary } from './admin.mappers';

describe('admin mappers', () => {
  describe('partnerSummary', () => {
    it('uses the profile name and university', () => {
      expect(
        partnerSummary({
          id: 'u1',
          email: 'ana@eafit.edu.co',
          profile: { name: 'Ana', university: 'EAFIT' },
        }),
      ).toEqual({ id: 'u1', name: 'Ana', university: 'EAFIT' });
    });

    it('falls back to the email and a dash without a profile', () => {
      expect(
        partnerSummary({
          id: 'u1',
          email: 'ana@eafit.edu.co',
          profile: null,
        }),
      ).toEqual({
        id: 'u1',
        name: 'ana@eafit.edu.co',
        university: '—',
      });
    });
  });

  describe('intersection', () => {
    it('matches case insensitively', () => {
      expect(intersection(['Cine', 'Café'], ['cine'])).toEqual(['Cine']);
    });

    it('returns nothing when there is no overlap', () => {
      expect(intersection(['Cine'], ['Correr'])).toEqual([]);
    });
  });

  describe('availabilityFor', () => {
    const rows = [
      { userId: 'a', date: new Date('2026-07-10'), timeSlot: '12:00' },
      { userId: 'b', date: new Date('2026-07-11'), timeSlot: '15:00' },
    ];

    it('keeps only the requested user rows', () => {
      expect(availabilityFor(rows, 'a')).toEqual([
        { date: rows[0].date, timeSlot: '12:00' },
      ]);
    });

    it('drops the user id from the output', () => {
      expect(availabilityFor(rows, 'a')[0]).not.toHaveProperty('userId');
    });
  });
});
