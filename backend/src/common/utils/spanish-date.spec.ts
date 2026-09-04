import { spanishDayLabel, spanishUtcDayLabel } from './spanish-date';

describe('spanish date labels', () => {
  it('labels a local date with weekday, day and month', () => {
    expect(spanishDayLabel(new Date(2026, 6, 10))).toBe('vie 10 jul');
  });

  it('labels a UTC date without shifting the day', () => {
    expect(spanishUtcDayLabel(new Date('2026-07-10T00:00:00Z'))).toBe(
      'vie 10 jul',
    );
  });

  it('covers a January date on the month boundary', () => {
    expect(spanishUtcDayLabel(new Date('2026-01-01T00:00:00Z'))).toBe(
      'jue 1 ene',
    );
  });
});
