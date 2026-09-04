import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

describe('Catalog (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  const server = () => context.app.getHttpServer() as Server;

  it('is public so the register form can use it before signing in', async () => {
    await request(server()).get('/catalog').expect(200);
  });

  it('serves the supported universities with domain and name', async () => {
    const response = await request(server()).get('/catalog').expect(200);

    expect(response.body.universities).toContainEqual({
      domain: 'eafit.edu.co',
      name: 'EAFIT',
      city: 'Medellín',
    });
  });

  it('serves every vocabulary the forms render', async () => {
    const response = await request(server()).get('/catalog').expect(200);

    for (const key of [
      'genders',
      'semesters',
      'relationshipTypes',
      'orientations',
      'genderInterests',
      'heightRanges',
      'venueTypes',
    ]) {
      expect(Array.isArray(response.body[key])).toBe(true);
      expect(response.body[key].length).toBeGreaterThan(0);
    }
  });

  it('serves the bounds the backend enforces', async () => {
    const response = await request(server()).get('/catalog').expect(200);

    expect(response.body.bounds).toMatchObject({
      minAge: 18,
      maxPhotos: 5,
      maxBioLength: 150,
    });
  });

  it('offers only genders the profile DTO accepts', async () => {
    const response = await request(server()).get('/catalog').expect(200);

    expect(response.body.genders).toEqual([
      'Masculino',
      'Femenino',
      'No binario',
      'Prefiero no decir',
    ]);
  });
});
