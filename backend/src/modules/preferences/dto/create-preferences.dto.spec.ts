import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePreferencesDto } from './create-preferences.dto';

const VALID = {
  ageRange: { min: 20, max: 28 },
  hobbies: ['cine', 'café', 'correr'],
  relationshipType: 'Seria',
  genderInterests: ['Mujeres', 'No binario'],
  sameUniversity: false,
  heightRange: 'Indiferente',
  energyVibe: ['Tranquilo/a'],
};

async function failingProperties(input: object): Promise<string[]> {
  const errors = await validate(plainToInstance(CreatePreferencesDto, input));
  return errors.map((error) => error.property);
}

describe('CreatePreferencesDto', () => {
  it('accepts several gender interests', async () => {
    expect(await failingProperties(VALID)).toEqual([]);
  });

  it('requires at least one gender interest', async () => {
    const failing = await failingProperties({ ...VALID, genderInterests: [] });
    expect(failing).toContain('genderInterests');
  });

  it('rejects a gender interest outside the catalog', async () => {
    const failing = await failingProperties({
      ...VALID,
      genderInterests: ['Todos'],
    });
    expect(failing).toContain('genderInterests');
  });

  it('rejects more gender interests than the catalog has', async () => {
    const failing = await failingProperties({
      ...VALID,
      genderInterests: ['Hombres', 'Mujeres', 'No binario', 'Hombres'],
    });
    expect(failing).toContain('genderInterests');
  });
});
