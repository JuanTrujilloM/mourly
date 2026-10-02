import { signedUrlExpiry } from './signed-url-window';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

describe('signedUrlExpiry', () => {
  describe('page', () => {
    it('expires at the end of the next full hour', () => {
      expect(signedUrlExpiry(Date.UTC(2026, 9, 1, 15, 20), 'page')).toBe(
        Date.UTC(2026, 9, 1, 17),
      );
    });

    it('stays the same for every moment inside one hour', () => {
      const start = signedUrlExpiry(Date.UTC(2026, 9, 1, 15, 0, 0, 0), 'page');
      const end = signedUrlExpiry(
        Date.UTC(2026, 9, 1, 15, 59, 59, 999),
        'page',
      );

      expect(end).toBe(start);
    });

    it('always leaves more than one hour of validity', () => {
      const now = Date.UTC(2026, 9, 1, 15, 59, 59, 999);

      expect(signedUrlExpiry(now, 'page') - now).toBeGreaterThan(HOUR_MS);
    });
  });

  describe('email', () => {
    it('expires seven days after the start of the current day', () => {
      expect(signedUrlExpiry(Date.UTC(2026, 9, 1, 15, 20), 'email')).toBe(
        Date.UTC(2026, 9, 8),
      );
    });

    it('never exceeds the seven-day ceiling of v4 signatures', () => {
      const now = Date.UTC(2026, 9, 1);

      expect(signedUrlExpiry(now, 'email') - now).toBeLessThanOrEqual(
        7 * DAY_MS,
      );
    });

    it('leaves more than six days to open the email', () => {
      const now = Date.UTC(2026, 9, 1, 23, 59, 59, 999);

      expect(signedUrlExpiry(now, 'email') - now).toBeGreaterThan(6 * DAY_MS);
    });
  });
});
