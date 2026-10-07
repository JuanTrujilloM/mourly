import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Server } from 'http';
import { TOO_MANY_ATTEMPTS_MESSAGE } from '../src/modules/auth/verification-messages';
import { createTestApp, type TestApp } from './setup-app';

const EMAIL = 'ana@eafit.edu.co';
const CODE = '123456';

describe('POST /auth/verify attempt limit (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: EMAIL,
    });
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue({
      id: 'code-1',
      codeHash: bcrypt.hashSync(CODE, 4),
      attempts: 4,
      resendCount: 0,
      consumedAt: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 300_000),
    });
  });

  const verify = () =>
    request(context.app.getHttpServer() as Server)
      .post('/auth/verify')
      .send({ email: EMAIL, code: CODE });

  it('refuses even the right code once another request took the last attempt', async () => {
    context.prisma.emailVerificationCode.updateMany.mockResolvedValue({
      count: 0,
    });

    const response = await verify().expect(400);

    expect(response.body.message).toBe(TOO_MANY_ATTEMPTS_MESSAGE);
    expect(context.prisma.emailVerificationCode.update).not.toHaveBeenCalled();
    expect(context.prisma.user.update).not.toHaveBeenCalled();
  });
});
