import request from 'supertest';
import type { Server } from 'http';
import { CELLPHONE_TAKEN_MESSAGE } from '../src/modules/auth/phone-verification.messages';
import { createTestApp, type TestApp } from './setup-app';

const CELLPHONE = '+573001112233';

describe('Phone verification (e2e)', () => {
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
    context.prisma.user.update.mockResolvedValue({ id: 'u1' });
  });

  const server = () => context.app.getHttpServer() as Server;
  const updatePhone = (body: Record<string, unknown>) =>
    request(server()).patch('/auth/phone').set('Cookie', cookie).send(body);

  describe('without a session', () => {
    it.each([
      ['patch', '/auth/phone'],
      ['post', '/auth/phone/send'],
      ['post', '/auth/phone/verify'],
    ])('rejects an anonymous %s %s', async (method, route) => {
      await request(server())[method as 'post'](route).expect(401);
    });
  });

  describe('PATCH /auth/phone', () => {
    it('rejects a number that is not a Colombian mobile', async () => {
      await updatePhone({ cellphone: '12345' }).expect(400);

      expect(context.prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects a missing body', async () => {
      await updatePhone({}).expect(400);
    });

    it('normalizes a local number and clears pending codes', async () => {
      const response = await updatePhone({ cellphone: '3001112233' }).expect(
        200,
      );

      expect(response.body).toEqual({ cellphone: CELLPHONE });
      expect(context.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { cellphone: CELLPHONE, cellphoneVerifiedAt: null },
      });
      expect(
        context.prisma.phoneVerificationCode.deleteMany,
      ).toHaveBeenCalledWith({
        where: { userId: 'u1', consumedAt: null },
      });
      expect(context.prisma.$transaction).toHaveBeenCalled();
    });

    it('accepts a number that already carries the country code', async () => {
      const response = await updatePhone({ cellphone: CELLPHONE }).expect(200);

      expect(response.body).toEqual({ cellphone: CELLPHONE });
    });

    it('rejects a number another account already uses', async () => {
      context.prisma.user.findUnique.mockResolvedValue({ id: 'u2' });

      const response = await updatePhone({ cellphone: CELLPHONE }).expect(400);

      expect(response.body.message).toBe(CELLPHONE_TAKEN_MESSAGE);
      expect(context.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cellphone: CELLPHONE },
      });
      expect(context.prisma.user.update).not.toHaveBeenCalled();
    });

    it('lets the owner resubmit their own number', async () => {
      context.prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

      await updatePhone({ cellphone: CELLPHONE }).expect(200);
    });
  });
});
