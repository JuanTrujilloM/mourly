import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Server } from 'http';
import { INVALID_CODE_MESSAGE } from '../src/modules/auth/verification-messages';
import { createTestApp, type TestApp } from './setup-app';

const EMAIL = 'ana@eafit.edu.co';
const CODE = '123456';

const USER = {
  id: 'u1',
  email: EMAIL,
  cellphone: null,
  cellphoneVerifiedAt: null,
  isVerified: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  profile: null,
  preferences: null,
};

const PENDING_CODE = {
  id: 'code-1',
  codeHash: bcrypt.hashSync(CODE, 4),
  attempts: 0,
  resendCount: 0,
  consumedAt: null,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 300_000),
};

describe('POST /auth/verify (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue(USER);
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue(
      PENDING_CODE,
    );
    context.prisma.refreshToken.create.mockResolvedValue({ id: 'rt1' });
  });

  const server = () => context.app.getHttpServer() as Server;
  const verify = (body: Record<string, unknown>) =>
    request(server()).post('/auth/verify').send(body);

  it('rejects an unknown email without revealing it', async () => {
    context.prisma.user.findUnique.mockResolvedValue(null);

    const response = await verify({
      email: 'ghost@eafit.edu.co',
      code: CODE,
    }).expect(400);

    expect(response.body.message).toBe(INVALID_CODE_MESSAGE);
    expect(
      context.prisma.emailVerificationCode.findFirst,
    ).not.toHaveBeenCalled();
  });

  it('rejects a code of the wrong shape', async () => {
    await verify({ email: EMAIL, code: '12' }).expect(400);
  });

  it('rejects a wrong code and counts the attempt', async () => {
    const response = await verify({ email: EMAIL, code: '654321' }).expect(400);

    expect(response.body.message).toBe(INVALID_CODE_MESSAGE);
    expect(context.prisma.emailVerificationCode.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { attempts: { increment: 1 } } }),
    );
    expect(context.prisma.user.update).not.toHaveBeenCalled();
  });

  it('opens a session and marks the account verified on the right code', async () => {
    const response = await verify({ email: EMAIL, code: CODE }).expect(200);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('access_token='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refresh_token='))).toBe(true);
    expect(response.body.user).toMatchObject({ id: 'u1', email: EMAIL });
    expect(context.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { isVerified: true },
    });
  });
});
