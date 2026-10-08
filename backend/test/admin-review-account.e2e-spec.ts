import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const CLOSE_ROUTE = '/admin/review-account/close';

describe('POST /admin/review-account/close (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });
    context.prisma.profile.updateMany.mockResolvedValue({ count: 1 });
    context.prisma.emailVerificationCode.deleteMany.mockResolvedValue({
      count: 0,
    });
  });

  const server = () => context.app.getHttpServer() as Server;

  it('rejects a non-admin session', async () => {
    const cookie = await context.accessCookie('u1', 'student@eafit.edu.co');

    await request(server()).post(CLOSE_ROUTE).set('Cookie', cookie).expect(403);
    expect(context.prisma.refreshToken.updateMany).not.toHaveBeenCalled();
  });

  it('revokes the review sessions and pauses the account for an admin', async () => {
    const cookie = await context.accessCookie('u9', 'admin@eafit.edu.co');

    const response = await request(server())
      .post(CLOSE_ROUTE)
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body).toEqual({
      revokedSessions: 3,
      pausedProfiles: 1,
      retiredCodes: 0,
      reviewLoginStillOpen: false,
    });
  });
});
