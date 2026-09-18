import { Logger } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { CODE_SENT_MESSAGE } from '../src/modules/auth/auth.messages';
import { VerificationDispatcherService } from '../src/modules/auth/verification-dispatcher.service';
import { createTestApp, type TestApp } from './setup-app';

const EMAIL = 'ana@eafit.edu.co';

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

describe('Auth code delivery (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.upsert.mockResolvedValue({ id: 'u1', email: EMAIL });
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue(null);
  });

  const server = () => context.app.getHttpServer() as Server;
  const requestCode = () =>
    request(server()).post('/auth/request-code').send({ email: EMAIL });
  const drainDeliveries = () =>
    context.app.get(VerificationDispatcherService).drain();

  it.each([
    ['inside the cooldown', { createdAt: new Date() }],
    ['once the three resends are spent', { resendCount: 3 }],
  ])('does not create another code %s', async (_, overrides) => {
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue(
      pendingCode(overrides),
    );

    const response = await requestCode().expect(200);

    await drainDeliveries();
    expect(response.body).toEqual({ message: CODE_SENT_MESSAGE });
    expect(context.prisma.emailVerificationCode.create).not.toHaveBeenCalled();
  });

  it('starts the resend count over once the last code expired', async () => {
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue(
      pendingCode({ resendCount: 3, expiresAt: new Date(Date.now() - 1000) }),
    );

    await requestCode().expect(200);

    await drainDeliveries();
    const [{ data }] = context.prisma.emailVerificationCode.create.mock
      .calls[0] as [{ data: { resendCount: number } }];
    expect(data.resendCount).toBe(0);
  });

  it('locks the account row before reading the pending code', async () => {
    await requestCode().expect(200);

    await drainDeliveries();
    const [lockOrder] = context.prisma.$queryRaw.mock.invocationCallOrder;
    const [readOrder] =
      context.prisma.emailVerificationCode.findFirst.mock.invocationCallOrder;
    expect(lockOrder).toBeLessThan(readOrder);
    expect(context.prisma.$transaction).toHaveBeenCalled();
  });

  it('still answers with the sent message when the delivery fails', async () => {
    const error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    context.prisma.emailVerificationCode.create.mockRejectedValueOnce(
      new Error('database down'),
    );

    const response = await requestCode().expect(200);

    await drainDeliveries();
    expect(response.body).toEqual({ message: CODE_SENT_MESSAGE });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
