import { normalizeEmail } from './normalize-email';

describe('normalizeEmail', () => {
  it('trims surrounding whitespace and lowercases', () => {
    expect(normalizeEmail('  Ana.Ruiz@EAFIT.edu.co  ')).toBe(
      'ana.ruiz@eafit.edu.co',
    );
  });

  it('leaves an already normalized address untouched', () => {
    expect(normalizeEmail('a@ces.edu.co')).toBe('a@ces.edu.co');
  });
});
