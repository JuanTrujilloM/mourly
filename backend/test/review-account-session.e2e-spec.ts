import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const REVIEW_EMAIL = 'revision@mourly.com';
const REVIEW_CODE = '482913';

const REVIEW_USER = {
  id: 'u-review',
  email: REVIEW_EMAIL,
  isReviewAccount: true,
  cellphone: null,
  cellphoneVerifiedAt: null,
  isVerified: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  profile: null,
  preferences: null,
};

describe('Review account session (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    process.env.REVIEW_ACCOUNT_EMAIL = REVIEW_EMAIL;
    process.env.REVIEW_ACCOUNT_CODE = REVIEW_CODE;
    context = await createTestApp();
  });

  afterAll(async () => {
    delete process.env.REVIEW_ACCOUNT_EMAIL;
    delete process.env.REVIEW_ACCOUNT_CODE;
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue(REVIEW_USER);
    context.prisma.user.findFirst.mockResolvedValue(null);
    context.prisma.user.update.mockResolvedValue(REVIEW_USER);
  });

  const server = () => context.app.getHttpServer() as Server;

  it('opens a session with the fixed code and sets both cookies', async () => {
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue({
      id: 'code-1',
      codeHash: bcrypt.hashSync(REVIEW_CODE, 4),
      attempts: 0,
      expiresAt: new Date(Date.now() + 300_000),
    });
    context.prisma.emailVerificationCode.updateMany.mockResolvedValue({
      count: 1,
    });
    context.prisma.refreshToken.create.mockResolvedValue({ id: 'rt1' });

    const response = await request(server())
      .post('/auth/verify')
      .send({ email: REVIEW_EMAIL, code: REVIEW_CODE })
      .expect(200);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('access_token='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refresh_token='))).toBe(true);
    expect(context.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u-review' },
      data: { isVerified: true },
    });
  });

  it('verifies the reviewer cellphone without sending an SMS', async () => {
    const cookie = await context.accessCookie('u-review', REVIEW_EMAIL);

    const response = await request(server())
      .patch('/auth/phone')
      .set('Cookie', cookie)
      .send({ cellphone: '3001112233' })
      .expect(200);

    expect(response.body).toEqual({
      cellphone: '+573001112233',
      cellphoneVerified: true,
    });
    expect(context.prisma.phoneVerificationCode.create).not.toHaveBeenCalled();
  });
});
