import { Logger } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { DAILY_PHONE_CODE_LIMIT } from '../src/modules/auth/phone-code-quota.service';
import { DAILY_LIMIT_MESSAGE } from '../src/modules/auth/phone-verification.messages';
import { createTestApp, type TestApp } from './setup-app';

const CELLPHONE = '+573001112233';

describe('POST /auth/phone/send limits (e2e)', () => {
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

  it('refuses to send once the daily quota is spent', async () => {
    context.prisma.user.findUnique.mockResolvedValue({
      cellphone: CELLPHONE,
      cellphoneVerifiedAt: null,
    });
    context.prisma.phoneVerificationCode.count.mockResolvedValue(
      DAILY_PHONE_CODE_LIMIT,
    );

    const response = await authed('post', '/auth/phone/send').expect(429);

    expect(response.body.message).toBe(DAILY_LIMIT_MESSAGE);
    expect(context.prisma.phoneVerificationCode.create).not.toHaveBeenCalled();
  });

  it('retires the previous phone code instead of deleting it', async () => {
    context.prisma.user.findUnique.mockResolvedValue({
      cellphone: CELLPHONE,
      cellphoneVerifiedAt: null,
    });

    await authed('post', '/auth/phone/send').expect(200);

    expect(
      context.prisma.phoneVerificationCode.deleteMany,
    ).not.toHaveBeenCalled();
    expect(
      context.prisma.phoneVerificationCode.updateMany,
    ).toHaveBeenCalledWith({
      where: { userId: 'u1', consumedAt: null },
      data: { consumedAt: expect.any(Date) as Date },
    });
  });

  it('texts a number stored in the legacy local format as E.164', async () => {
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    context.prisma.user.findUnique.mockResolvedValue({
      cellphone: '3001112233',
      cellphoneVerifiedAt: null,
    });

    await authed('post', '/auth/phone/send').expect(200);

    const lines = warn.mock.calls.map(([message]) => String(message));
    expect(
      lines.some((line) => line.includes(`[dev sms] to ${CELLPHONE}:`)),
    ).toBe(true);
    warn.mockRestore();
  });
});
