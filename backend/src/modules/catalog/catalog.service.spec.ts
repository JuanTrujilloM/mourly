import { UniversitiesService } from '../universities/universities.service';
import { CatalogService } from './catalog.service';
import { GENDERS, SEMESTERS } from '../profile/constants/profile-options';
import { RELATIONSHIP_TYPES } from '../preferences/constants/preferences-options';

const ACTIVE = [
  {
    id: 'uni_eafit',
    domain: 'eafit.edu.co',
    name: 'EAFIT',
    city: 'Medellín',
    active: true,
  },
];

function setup(universities: unknown[] = ACTIVE) {
  const findActive = jest.fn().mockResolvedValue(universities);
  return {
    service: new CatalogService({
      findActive,
    } as unknown as UniversitiesService),
    findActive,
  };
}

describe('CatalogService', () => {
  it('serves only active universities, from the database', async () => {
    const { service, findActive } = setup();

    const catalog = await service.get();

    expect(findActive).toHaveBeenCalled();
    expect(catalog.universities).toEqual([
      { domain: 'eafit.edu.co', name: 'EAFIT', city: 'Medellín' },
    ]);
  });

  it('never leaks the university row id', async () => {
    const { service } = setup();

    const catalog = await service.get();

    expect(catalog.universities[0]).not.toHaveProperty('id');
  });

  it('copes with an empty university table', async () => {
    const { service } = setup([]);

    expect((await service.get()).universities).toEqual([]);
  });

  it('serves the same gender vocabulary the DTO validates against', async () => {
    expect((await setup().service.get()).genders).toEqual([...GENDERS]);
  });

  it('serves the same semester vocabulary the DTO validates against', async () => {
    expect((await setup().service.get()).semesters).toEqual([...SEMESTERS]);
  });

  it('serves the same relationship vocabulary the DTO validates against', async () => {
    expect((await setup().service.get()).relationshipTypes).toEqual([
      ...RELATIONSHIP_TYPES,
    ]);
  });

  it('serves the bounds the backend enforces', async () => {
    expect((await setup().service.get()).bounds).toEqual({
      minAge: 18,
      ageMin: 18,
      ageMax: 40,
      maxPhotos: 5,
      maxBioLength: 150,
      minHobbies: 3,
      minVibes: 1,
    });
  });
});
