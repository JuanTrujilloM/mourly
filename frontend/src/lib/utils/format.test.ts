import { describe, expect, it } from 'vitest';
import {
  formatCOP,
  formatCalendarDate,
  formatDate,
  formatDateTime,
} from './format';

describe('formatCOP', () => {
  it('renders a peso amount without decimals', () => {
    const formatted = formatCOP(35000);

    expect(formatted).toMatch(/35\.?000/);
    expect(formatted).not.toContain(',00');
  });

  it('renders zero', () => {
    expect(formatCOP(0)).toMatch(/0/);
  });
});

describe('formatDate', () => {
  it('accepts an ISO string', () => {
    expect(formatDate('2026-07-10T15:00:00.000Z')).toMatch(/2026/);
  });

  it('accepts a Date instance', () => {
    expect(formatDate(new Date('2026-07-10T15:00:00.000Z'))).toMatch(/2026/);
  });
});

describe('formatCalendarDate', () => {
  it('reads the day in UTC so a stored calendar day never shifts', () => {
    expect(formatCalendarDate('2026-07-10')).toMatch(/10/);
  });

  it('keeps the day for an instant late in the UTC day', () => {
    expect(formatCalendarDate('2026-07-10T23:30:00.000Z')).toMatch(/10/);
  });
});

describe('formatDateTime', () => {
  it('includes both the day and the time', () => {
    const formatted = formatDateTime('2026-07-10T15:00:00.000Z');

    expect(formatted).toMatch(/10/);
    expect(formatted).toMatch(/:/);
  });
});
