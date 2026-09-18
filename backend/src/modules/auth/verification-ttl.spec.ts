import { parseTtlMinutes } from './verification-ttl';

describe('parseTtlMinutes', () => {
  it('reads a configured value', () => {
    expect(parseTtlMinutes('30')).toBe(30);
  });

  it.each([undefined, '', '0', 'abc'])(
    'defaults to ten minutes for %p',
    (value) => {
      expect(parseTtlMinutes(value)).toBe(10);
    },
  );
});
