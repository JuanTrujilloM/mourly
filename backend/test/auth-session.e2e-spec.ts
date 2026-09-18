import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const EMAIL = 'ana@eafit.edu.co';

const USER_ROW = {
  id: 'u1',
  email: EMAIL,
  cellphone: '+573001112233',
  cellphoneVerifiedAt: null,
  isVerified: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  profile: { id: 'p1' },
  preferences: { id: 'pref1' },
};

describe('Auth session (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue(USER_ROW);
  });

  const server = () => context.app.getHttpServer() as Server;
  const asUser = () => context.accessCookie('u1', EMAIL);

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
      const response = await request(server())
        .get('/auth/me')
        .set('Cookie', await asUser())
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'u1',
        email: EMAIL,
        cellphone: '+573001112233',
        cellphoneVerified: false,
        university: 'EAFIT',
        onboardingCompleted: true,
        isAdmin: false,
      });
      expect(response.body).not.toHaveProperty('profile');
      expect(response.body).not.toHaveProperty('cellphoneVerifiedAt');
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
