import { firstName } from './first-name';

describe('firstName', () => {
  it('keeps only the first word of a full name', () => {
    expect(firstName('Miguel Ángel Torres')).toBe('Miguel');
  });

  it('ignores surrounding and repeated spaces', () => {
    expect(firstName('  Sara   Betancur ')).toBe('Sara');
  });

  it('returns a single name as is', () => {
    expect(firstName('Jeronimo')).toBe('Jeronimo');
  });
});
