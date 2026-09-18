import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Server } from 'http';
import { INVALID_PHONE_CODE_MESSAGE } from '../src/modules/auth/phone-verification.messages';
import { createTestApp, type TestApp } from './setup-app';

const CODE = '123456';

const PENDING_USER = {
  id: 'u1',
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
  cellphoneVerifiedAt: null,
  isVerified: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  profile: null,
  preferences: null,
};

const PENDING_CODE = {
  id: 'code-1',
  codeHash: bcrypt.hashSync(CODE, 4),
  attempts: 0,
  consumedAt: null,
  expiresAt: new Date(Date.now() + 300_000),
};

describe('POST /auth/phone/verify (e2e)', () => {
  let context: TestApp;
  let cookie: string;

  beforeAll(async () => {
    context = await createTestApp();
    cookie = await context.accessCookie('u1', PENDING_USER.email);
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue(PENDING_USER);
    context.prisma.phoneVerificationCode.findFirst.mockResolvedValue(
      PENDING_CODE,
    );
  });

  const server = () => context.app.getHttpServer() as Server;
  const verifyCode = (body: Record<string, unknown>) =>
    request(server())
      .post('/auth/phone/verify')
      .set('Cookie', cookie)
      .send(body);

  it.each([{ code: '12' }, { code: 'abcdef' }, {}])(
    'rejects a code of the wrong shape %p',
    async (body) => {
      await verifyCode(body).expect(400);

      expect(
        context.prisma.phoneVerificationCode.findFirst,
      ).not.toHaveBeenCalled();
    },
  );

  it('rejects a wrong code and counts the attempt', async () => {
    const response = await verifyCode({ code: '654321' }).expect(400);

    expect(response.body.message).toBe(INVALID_PHONE_CODE_MESSAGE);
    expect(context.prisma.phoneVerificationCode.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { attempts: { increment: 1 } } }),
    );
    expect(context.prisma.user.update).not.toHaveBeenCalled();
  });

  it('stamps the verification and returns the verified user', async () => {
    context.prisma.user.findUnique
      .mockResolvedValueOnce(PENDING_USER)
      .mockResolvedValueOnce({
        ...PENDING_USER,
        cellphoneVerifiedAt: new Date(),
      });

    const response = await verifyCode({ code: CODE }).expect(200);

    expect(response.body.user).toMatchObject({
      id: 'u1',
      cellphone: '+573001112233',
      cellphoneVerified: true,
    });
    expect(context.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { cellphoneVerifiedAt: expect.any(Date) },
    });
  });
});
