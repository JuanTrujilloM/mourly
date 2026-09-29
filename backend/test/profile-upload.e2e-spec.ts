import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const PROFILE_FIELDS = {
  name: 'Ana',
  dateOfBirth: '2003-04-12',
  gender: 'Femenino',
  height: '165',
  biography: 'Hola',
  major: 'Ingeniería',
  semester: '5',
};

describe('Profile photo upload (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const server = () => context.app.getHttpServer() as Server;

  async function uploadPhoto(content: Buffer, contentType: string) {
    const call = request(server())
      .post('/profile')
      .set('Cookie', await context.accessCookie('u1', 'ana@eafit.edu.co'));
    for (const [field, value] of Object.entries(PROFILE_FIELDS)) {
      call.field(field, value);
    }
    return call.attach('photos', content, { filename: 'a.png', contentType });
  }

  it('rejects a webp image', async () => {
    const response = await uploadPhoto(Buffer.from('RIFF'), 'image/webp');

    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).toContain('image/jpeg, image/png');
  });

  it('rejects a file disguised as a png', async () => {
    const response = await uploadPhoto(Buffer.from('<svg/>'), 'image/png');

    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).toContain('real JPG or PNG');
    expect(context.prisma.profile.findUnique).not.toHaveBeenCalled();
  });

  it('rejects an image over the size limit', async () => {
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1);

    const response = await uploadPhoto(oversized, 'image/png');

    expect(response.status).toBe(413);
  });
});
