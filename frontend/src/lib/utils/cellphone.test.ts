import { describe, expect, it } from 'vitest';
import { toLocalCellphone } from './cellphone';

describe('toLocalCellphone', () => {
  it.each([
    ['3001112233', '3001112233'],
    ['300 111 2233', '3001112233'],
    ['300-111-2233', '3001112233'],
    ['+573001112233', '3001112233'],
    ['+57 300 111 2233', '3001112233'],
    ['573001112233', '3001112233'],
  ])('reduces %s to the local number', (raw, expected) => {
    expect(toLocalCellphone(raw)).toBe(expected);
  });

  it('leaves a short number for the schema to reject', () => {
    expect(toLocalCellphone('5712')).toBe('5712');
  });
});
