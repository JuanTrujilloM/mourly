import { sharedHobbyNames } from './shared-hobbies';

const withHobbies = (...names: string[]) => ({
  profile: { hobbies: names.map((name) => ({ hobby: { name } })) },
});

describe('sharedHobbyNames', () => {
  it('keeps only the hobbies both have, in the viewer order', () => {
    expect(
      sharedHobbyNames(
        withHobbies('Cine', 'Ciclismo', 'Café'),
        withHobbies('Café', 'Yoga', 'Cine'),
      ),
    ).toEqual(['Cine', 'Café']);
  });

  it('never shows more than three', () => {
    const all = ['Cine', 'Ciclismo', 'Café', 'Yoga', 'Lectura'];

    expect(
      sharedHobbyNames(withHobbies(...all), withHobbies(...all)),
    ).toHaveLength(3);
  });

  it('is empty without a profile', () => {
    expect(sharedHobbyNames(null, withHobbies('Cine'))).toEqual([]);
  });
});
