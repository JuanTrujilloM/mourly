import { describe, expect, it } from 'vitest';
import { dateBoardFor } from './date-board';

describe('dateBoardFor', () => {
  it('reads the instant in Colombia time', () => {
    // 17:00 UTC is noon in Colombia.
    expect(dateBoardFor('2026-09-22T17:00:00.000Z')).toEqual({
      day: 'mar 22 sept',
      time: '12:00 p. m.',
    });
  });

  it('keeps the Colombian day when UTC is already tomorrow', () => {
    // Saturday 19:00 in Colombia is Sunday 00:00 UTC.
    expect(dateBoardFor('2026-09-27T00:00:00.000Z')).toEqual({
      day: 'sáb 26 sept',
      time: '7:00 p. m.',
    });
  });

  it('writes the morning as a. m.', () => {
    expect(dateBoardFor('2026-01-05T14:30:00.000Z').time).toBe('9:30 a. m.');
  });
});
