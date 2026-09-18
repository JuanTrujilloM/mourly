import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const CELLPHONE = '+573001112233';

describe('PATCH /auth/phone with SMS verification off (e2e)', () => {
  let context: TestApp;
  let cookie: string;

  beforeAll(async () => {
    process.env.PHONE_SMS_VERIFICATION_ENABLED = 'false';
    context = await createTestApp();
    cookie = await context.accessCookie('u1', 'ana@eafit.edu.co');
  });

  afterAll(async () => {
    delete process.env.PHONE_SMS_VERIFICATION_ENABLED;
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.findUnique.mockResolvedValue(null);
    context.prisma.user.findFirst.mockResolvedValue(null);
    context.prisma.user.update.mockResolvedValue({ id: 'u1' });
  });

  const server = () => context.app.getHttpServer() as Server;
  const updatePhone = (cellphone: string) =>
    request(server())
      .patch('/auth/phone')
      .set('Cookie', cookie)
      .send({ cellphone });

  it('verifies the number without sending any SMS', async () => {
    const response = await updatePhone('3001112233').expect(200);

    expect(response.body).toEqual({
      cellphone: CELLPHONE,
      cellphoneVerified: true,
    });
    const [{ data }] = context.prisma.user.update.mock.calls[0] as [
      { data: { cellphoneVerifiedAt: Date } },
    ];
    expect(data.cellphoneVerifiedAt).toBeInstanceOf(Date);
    expect(context.prisma.phoneVerificationCode.create).not.toHaveBeenCalled();
  });

  it('still refuses a number another account verified', async () => {
    context.prisma.user.findFirst.mockResolvedValue({ id: 'u2' });

    await updatePhone(CELLPHONE).expect(400);

    expect(context.prisma.user.update).not.toHaveBeenCalled();
  });
});
