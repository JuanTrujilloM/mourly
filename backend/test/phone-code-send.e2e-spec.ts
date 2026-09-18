import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Server } from 'http';
import {
  ALREADY_VERIFIED_MESSAGE,
  CELLPHONE_REQUIRED_MESSAGE,
  SMS_SENT_MESSAGE,
  TOO_MANY_CODES_MESSAGE,
} from '../src/modules/auth/phone-verification.messages';
import { createTestApp, type TestApp } from './setup-app';

const CELLPHONE = '+573001112233';
const PENDING_USER = { cellphone: CELLPHONE, cellphoneVerifiedAt: null };

describe('POST /auth/phone/send (e2e)', () => {
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
    context.prisma.user.findUnique.mockResolvedValue(PENDING_USER);
    context.prisma.phoneVerificationCode.findFirst.mockResolvedValue(null);
  });

  const server = () => context.app.getHttpServer() as Server;
  const sendCode = () =>
    request(server()).post('/auth/phone/send').set('Cookie', cookie);

  it('requires a cellphone first', async () => {
    context.prisma.user.findUnique.mockResolvedValue({
      ...PENDING_USER,
      cellphone: null,
    });

    const response = await sendCode().expect(400);

    expect(response.body.message).toBe(CELLPHONE_REQUIRED_MESSAGE);
  });

  it('refuses once the cellphone is verified', async () => {
    context.prisma.user.findUnique.mockResolvedValue({
      ...PENDING_USER,
      cellphoneVerifiedAt: new Date(),
    });

    const response = await sendCode().expect(400);

    expect(response.body.message).toBe(ALREADY_VERIFIED_MESSAGE);
    expect(context.prisma.phoneVerificationCode.create).not.toHaveBeenCalled();
  });

  it('answers 429 inside the cooldown', async () => {
    context.prisma.phoneVerificationCode.findFirst.mockResolvedValue({
      id: 'code-1',
      resendCount: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 300_000),
    });

    const response = await sendCode().expect(429);

    expect(response.body.message).toBe(TOO_MANY_CODES_MESSAGE);
    expect(context.prisma.phoneVerificationCode.create).not.toHaveBeenCalled();
  });

  it('stores a hashed code and texts it to the cellphone', async () => {
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    const response = await sendCode().expect(200);

    expect(response.body).toEqual({ message: SMS_SENT_MESSAGE });
    const smsLog = warn.mock.calls
      .map(([message]) => String(message))
      .find((line) => line.includes(`[dev sms] to ${CELLPHONE}`));
    const code = /Mourly: (\d{6}) /.exec(smsLog ?? '')?.[1] ?? '';
    const [{ data }] = context.prisma.phoneVerificationCode.create.mock
      .calls[0] as [{ data: { userId: string; codeHash: string } }];
    expect(code).toHaveLength(6);
    expect(data.userId).toBe('u1');
    expect(bcrypt.compareSync(code, data.codeHash)).toBe(true);
    warn.mockRestore();
  });
});
