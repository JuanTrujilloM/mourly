import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const CELLPHONE = '+573001112233';

describe('PATCH /auth/phone ownership rules (e2e)', () => {
  let context: TestApp;
  let cookie: string;

  beforeAll(async () => {
    context = await createTestApp();
    cookie = await context.accessCookie('u1', 'ana@eafit.edu.co');
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue(null);
    context.prisma.user.findFirst.mockResolvedValue(null);
    context.prisma.user.update.mockResolvedValue({ id: 'u1' });
    context.prisma.phoneVerificationCode.count.mockResolvedValue(0);
    context.prisma.phoneVerificationCode.findFirst.mockResolvedValue(null);
  });

  const server = () => context.app.getHttpServer() as Server;
  const authed = (method: 'patch' | 'post', route: string) =>
    request(server())[method](route).set('Cookie', cookie);

  it('takes an unverified number back from the account holding it', async () => {
    await authed('patch', '/auth/phone')
      .send({ cellphone: CELLPHONE })
      .expect(200);

    expect(context.prisma.user.updateMany).toHaveBeenCalledWith({
      where: {
        cellphone: CELLPHONE,
        cellphoneVerifiedAt: null,
        id: { not: 'u1' },
      },
      data: { cellphone: null },
    });
  });

  it('leaves codes and cooldown alone when the number does not change', async () => {
    context.prisma.user.findUnique.mockResolvedValue({ cellphone: CELLPHONE });

    await authed('patch', '/auth/phone')
      .send({ cellphone: '3001112233' })
      .expect(200);

    expect(context.prisma.$transaction).not.toHaveBeenCalled();
    expect(context.prisma.user.update).not.toHaveBeenCalled();
  });
});
