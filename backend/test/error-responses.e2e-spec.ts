import request from 'supertest';
import type { Server } from 'http';
import { Prisma } from '../src/generated/prisma/client';
import { createTestApp, type TestApp } from './setup-app';

const EMAIL = 'ana@eafit.edu.co';

describe('Error responses (e2e)', () => {
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
  const requestCode = (body: Record<string, unknown>) =>
    request(server()).post('/auth/request-code').send(body);

  it('turns a unique constraint violation into a 409', async () => {
    context.prisma.user.upsert.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.8.0',
      }),
    );

    const response = await requestCode({ email: EMAIL }).expect(409);

    expect(response.body).toEqual({
      statusCode: 409,
      message: 'That value is already in use.',
    });
  });

  it('never leaks an internal error message', async () => {
    context.prisma.user.upsert.mockRejectedValueOnce(
      new Error('postgresql://user:password@host/db is unreachable'),
    );

    const response = await requestCode({ email: EMAIL }).expect(500);

    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Something went wrong. Please try again.',
    });
    expect(JSON.stringify(response.body)).not.toContain('password');
  });

  it('reports validation problems as a message list', async () => {
    const response = await requestCode({ email: 'nope' }).expect(400);

    expect(Array.isArray(response.body.message)).toBe(true);
  });
});
