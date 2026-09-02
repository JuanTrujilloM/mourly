import { nameOf, recipientOf } from './match-recipients';

describe('match recipients', () => {
  it('uses the profile name when there is one', () => {
    expect(nameOf({ profile: { name: 'Ana' } })).toBe('Ana');
  });

  it('falls back to a generic label without a profile', () => {
    expect(nameOf({ profile: null })).toBe('tu match');
  });

  it('builds a recipient from the user contact fields', () => {
    expect(
      recipientOf({
        email: 'ana@eafit.edu.co',
        cellphone: '+573001112233',
        profile: { name: 'Ana' },
      }),
    ).toEqual({
      name: 'Ana',
      email: 'ana@eafit.edu.co',
      cellphone: '+573001112233',
    });
  });

  it('uses an empty name when the profile is missing', () => {
    expect(
      recipientOf({
        email: 'ana@eafit.edu.co',
        cellphone: '+573001112233',
        profile: null,
      }).name,
    ).toBe('');
  });
});
