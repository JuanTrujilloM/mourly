import request from 'supertest';
import type { Server } from 'http';
import { CODE_SENT_MESSAGE } from '../src/modules/auth/auth.messages';
import { VerificationDispatcherService } from '../src/modules/auth/verification-dispatcher.service';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '../src/modules/universities/university-messages';
import { createTestApp, type TestApp } from './setup-app';

const EMAIL = 'ana@eafit.edu.co';

describe('POST /auth/request-code (e2e)', () => {
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
  const requestCode = (body: Record<string, unknown>) =>
    request(server()).post('/auth/request-code').send(body);
  const drainDeliveries = () =>
    context.app.get(VerificationDispatcherService).drain();

  it('creates the account on first contact and announces the code', async () => {
    const response = await requestCode({ email: EMAIL }).expect(200);

    await drainDeliveries();
    expect(response.body).toEqual({ message: CODE_SENT_MESSAGE });
    expect(context.prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: EMAIL },
      update: {},
      create: { email: EMAIL },
    });
    expect(context.prisma.emailVerificationCode.create).toHaveBeenCalled();
  });

  it('accepts the domain however it was capitalised', async () => {
    await requestCode({ email: 'Ana@EAFIT.edu.CO' }).expect(200);

    await drainDeliveries();
    expect(context.prisma.user.upsert.mock.calls[0][0].where).toEqual({
      email: EMAIL,
    });
  });

  it('rejects a non-university email', async () => {
    const response = await requestCode({ email: 'ana@gmail.com' }).expect(400);

    expect(response.body.message).toContain(UNSUPPORTED_UNIVERSITY_MESSAGE);
    expect(context.prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('rejects a missing body', async () => {
    await requestCode({}).expect(400);

    expect(context.prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('strips unknown fields instead of trusting them', async () => {
    await requestCode({ email: EMAIL, isVerified: true }).expect(200);

    await drainDeliveries();
    expect(context.prisma.user.upsert.mock.calls[0][0].create).toEqual({
      email: EMAIL,
    });
  });

  it('answers before the code is issued and mailed', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    context.prisma.$transaction.mockImplementationOnce(async () => {
      await gate;
      return false;
    });

    const outcome = await Promise.race([
      requestCode({ email: EMAIL }).then((response) => response.status),
      new Promise((resolve) => setTimeout(() => resolve('waiting'), 1500)),
    ]);
    release();
    await drainDeliveries();

    expect(outcome).toBe(200);
  });
});
