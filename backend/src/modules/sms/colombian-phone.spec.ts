import { toE164Colombia } from './colombian-phone';

describe('toE164Colombia', () => {
  it.each([
    ['3001234567', '+573001234567'],
    ['573001234567', '+573001234567'],
    ['+573001234567', '+573001234567'],
    ['300 123-4567', '+573001234567'],
    ['(300) 123 4567', '+573001234567'],
    ['+57 300 123 4567', '+573001234567'],
  ])('normalizes %s to %s', (raw, expected) => {
    expect(toE164Colombia(raw)).toBe(expected);
  });
});
