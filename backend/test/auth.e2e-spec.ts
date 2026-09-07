import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const NEUTRAL_MESSAGE =
  'If the email is valid, a verification code has been sent.';

const VALID_SIGNUP = {
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
};

describe('Auth (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue(null);
    context.prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: VALID_SIGNUP.email,
    });
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue(null);
    context.prisma.emailVerificationCode.deleteMany.mockResolvedValue({
      count: 0,
    });
    context.prisma.emailVerificationCode.create.mockResolvedValue({
      id: 'code-1',
    });
  });

  const server = () => context.app.getHttpServer() as Server;

  describe('POST /auth/register', () => {
    it('accepts a supported university email', async () => {
      const response = await request(server())
        .post('/auth/register')
        .send(VALID_SIGNUP)
        .expect(200);

      expect(response.body).toEqual({ message: NEUTRAL_MESSAGE });
    });

    it('accepts the domain however it was capitalised', async () => {
      const response = await request(server())
        .post('/auth/register')
        .send({ email: 'Ana@EAFIT.edu.CO', cellphone: VALID_SIGNUP.cellphone })
        .expect(200);

      expect(response.body).toEqual({ message: NEUTRAL_MESSAGE });
    });

    it('rejects a non-university email', async () => {
      await request(server())
        .post('/auth/register')
        .send({ ...VALID_SIGNUP, email: 'ana@gmail.com' })
        .expect(400);
    });

    it('rejects a malformed cellphone', async () => {
      await request(server())
        .post('/auth/register')
        .send({ ...VALID_SIGNUP, cellphone: '12345' })
        .expect(400);
    });

    it('rejects a missing body', async () => {
      await request(server()).post('/auth/register').send({}).expect(400);
    });

    it('answers identically for an already registered email', async () => {
      context.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: VALID_SIGNUP.email,
      });
      context.prisma.emailVerificationCode.findFirst.mockResolvedValue({
        id: 'code-1',
        consumedAt: new Date(),
        createdAt: new Date(Date.now() - 120_000),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 0,
      });

      const response = await request(server())
        .post('/auth/register')
        .send(VALID_SIGNUP)
        .expect(200);

      expect(response.body).toEqual({ message: NEUTRAL_MESSAGE });
    });

    it('strips unknown fields instead of trusting them', async () => {
      await request(server())
        .post('/auth/register')
        .send({ ...VALID_SIGNUP, isVerified: true })
        .expect(200);

      const created = context.prisma.user.create.mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      expect(created.data.isVerified).toBeUndefined();
    });
  });

  describe('POST /auth/login', () => {
    it('answers neutrally for an unknown account', async () => {
      const response = await request(server())
        .post('/auth/login')
        .send({ email: 'ghost@eafit.edu.co' })
        .expect(200);

      expect(response.body).toEqual({ message: NEUTRAL_MESSAGE });
    });

    it('rejects a malformed email', async () => {
      await request(server())
        .post('/auth/login')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('POST /auth/verify', () => {
    it('rejects an unknown email without revealing it', async () => {
      const response = await request(server())
        .post('/auth/verify')
        .send({ email: 'ghost@eafit.edu.co', code: '123456' })
        .expect(400);

      expect(response.body.message).toBe(
        'El código es incorrecto o expiró. Si todavía no tenés cuenta, registrate primero.',
      );
    });

    it('rejects a code of the wrong shape', async () => {
      await request(server())
        .post('/auth/verify')
        .send({ email: 'ana@eafit.edu.co', code: '12' })
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    it('rejects an anonymous request', async () => {
      await request(server()).get('/auth/me').expect(401);
    });

    it('rejects a forged cookie', async () => {
      await request(server())
        .get('/auth/me')
        .set('Cookie', 'access_token=not-a-real-jwt')
        .expect(401);
    });

    it('returns the safe user for a valid session', async () => {
      context.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'ana@eafit.edu.co',
        cellphone: '+573001112233',
        isVerified: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        profile: { id: 'p1' },
        preferences: { id: 'pref1' },
      });
      const cookie = await context.accessCookie('u1', 'ana@eafit.edu.co');

      const response = await request(server())
        .get('/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'u1',
        email: 'ana@eafit.edu.co',
        onboardingCompleted: true,
        isAdmin: false,
      });
      expect(response.body).not.toHaveProperty('profile');
    });
  });

  describe('POST /auth/resend', () => {
    const KNOWN_USER = { id: 'u1', email: VALID_SIGNUP.email };

    function pendingCode(overrides: Record<string, unknown> = {}) {
      return {
        id: 'code-1',
        consumedAt: null,
        attempts: 0,
        resendCount: 0,
        createdAt: new Date(Date.now() - 120_000),
        expiresAt: new Date(Date.now() + 300_000),
        ...overrides,
      };
    }

    it('answers neutrally for an unknown email', async () => {
      const response = await request(server())
        .post('/auth/resend')
        .send({ email: 'ghost@eafit.edu.co' })
        .expect(200);

      expect(response.body).toEqual({ message: NEUTRAL_MESSAGE });
      expect(
        context.prisma.emailVerificationCode.create,
      ).not.toHaveBeenCalled();
    });

    it('sends a new code to an account that verified before', async () => {
      context.prisma.user.findUnique.mockResolvedValue(KNOWN_USER);
      context.prisma.emailVerificationCode.findFirst.mockResolvedValue(
        pendingCode({ consumedAt: new Date() }),
      );

      await request(server())
        .post('/auth/resend')
        .send({ email: VALID_SIGNUP.email })
        .expect(200);

      expect(context.prisma.emailVerificationCode.create).toHaveBeenCalled();
    });

    it('refuses a resend that is still inside the cooldown', async () => {
      context.prisma.user.findUnique.mockResolvedValue(KNOWN_USER);
      context.prisma.emailVerificationCode.findFirst.mockResolvedValue(
        pendingCode({ createdAt: new Date() }),
      );

      await request(server())
        .post('/auth/resend')
        .send({ email: VALID_SIGNUP.email })
        .expect(429);

      expect(
        context.prisma.emailVerificationCode.create,
      ).not.toHaveBeenCalled();
    });

    it('answers 403 once the three resends are spent', async () => {
      context.prisma.user.findUnique.mockResolvedValue(KNOWN_USER);
      context.prisma.emailVerificationCode.findFirst.mockResolvedValue(
        pendingCode({ resendCount: 3 }),
      );

      const response = await request(server())
        .post('/auth/resend')
        .send({ email: VALID_SIGNUP.email })
        .expect(403);

      expect(response.body.message).toBe(
        'Alcanzaste el máximo de reenvíos. Esperá unos minutos y volvé a intentarlo.',
      );
      expect(
        context.prisma.emailVerificationCode.create,
      ).not.toHaveBeenCalled();
    });

    it('allows a resend again once the last code expired', async () => {
      context.prisma.user.findUnique.mockResolvedValue(KNOWN_USER);
      context.prisma.emailVerificationCode.findFirst.mockResolvedValue(
        pendingCode({ resendCount: 3, expiresAt: new Date(Date.now() - 1000) }),
      );

      await request(server())
        .post('/auth/resend')
        .send({ email: VALID_SIGNUP.email })
        .expect(200);

      const [{ data }] = context.prisma.emailVerificationCode.create.mock
        .calls[0] as [{ data: { resendCount: number } }];
      expect(data.resendCount).toBe(0);
    });
  });

  describe('POST /auth/refresh', () => {
    it('rejects a request with no refresh cookie', async () => {
      await request(server()).post('/auth/refresh').expect(401);
    });

    it('rejects an unknown refresh token', async () => {
      context.prisma.refreshToken.findUnique.mockResolvedValue(null);

      await request(server())
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=nonsense')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('clears both session cookies', async () => {
      const response = await request(server()).post('/auth/logout').expect(200);

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c) => c.startsWith('access_token=;'))).toBe(true);
      expect(cookies.some((c) => c.startsWith('refresh_token=;'))).toBe(true);
    });
  });
});
