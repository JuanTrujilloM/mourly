import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from './availability-link.service';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function setup(env: Record<string, string> = {}) {
  const create = jest.fn().mockResolvedValue({ id: 'link-1' });
  const deleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const findUnique = jest.fn().mockResolvedValue(null);
  const update = jest.fn().mockResolvedValue({});
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });

  const prisma = {
    availabilityLink: { create, deleteMany, findUnique, update, updateMany },
  } as unknown as PrismaService;
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;

  return {
    service: new AvailabilityLinkService(prisma, config),
    create,
    deleteMany,
    findUnique,
    update,
    updateMany,
  };
}

function storedLink(overrides: Record<string, unknown> = {}) {
  return {
    id: 'link-1',
    matchId: 'm1',
    userId: 'u1',
    step: 'VENUE',
    consumedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    ...overrides,
  };
}

describe('AvailabilityLinkService', () => {
  describe('issueForMatchUser', () => {
    it('replaces any previous link for the same match and user', async () => {
      const { service, deleteMany } = setup();

      await service.issueForMatchUser('m1', 'u1');

      expect(deleteMany).toHaveBeenCalledWith({
        where: { matchId: 'm1', userId: 'u1' },
      });
    });

    it('stores only the token hash', async () => {
      const { service, create } = setup();

      const token = await service.issueForMatchUser('m1', 'u1');

      expect(create.mock.calls[0][0].data.tokenHash).toBe(sha256(token));
    });

    it('starts at the venue step by default', async () => {
      const { service, create } = setup();

      await service.issueForMatchUser('m1', 'u1');

      expect(create.mock.calls[0][0].data.step).toBe('VENUE');
    });

    it('can be issued straight at the availability step', async () => {
      const { service, create } = setup();

      await service.issueForMatchUser('m1', 'u1', 'AVAILABILITY');

      expect(create.mock.calls[0][0].data.step).toBe('AVAILABILITY');
    });
  });

  describe('validate', () => {
    it('reports an unknown token as invalid', async () => {
      const { service } = setup();

      expect(await service.validate('nope')).toEqual({ status: 'invalid' });
    });

    it('reports a used token as consumed', async () => {
      const { service, findUnique } = setup();
      findUnique.mockResolvedValue(storedLink({ consumedAt: new Date() }));

      expect(await service.validate('t')).toEqual({ status: 'consumed' });
    });

    it('reports a stale token as expired', async () => {
      const { service, findUnique } = setup();
      findUnique.mockResolvedValue(
        storedLink({ expiresAt: new Date(Date.now() - 1000) }),
      );

      expect(await service.validate('t')).toEqual({ status: 'expired' });
    });

    it('returns the link details for a good token', async () => {
      const { service, findUnique } = setup();
      findUnique.mockResolvedValue(storedLink());

      expect(await service.validate('t')).toEqual({
        status: 'ok',
        link: { id: 'link-1', matchId: 'm1', userId: 'u1', step: 'VENUE' },
      });
    });

    it('looks the token up by its hash', async () => {
      const { service, findUnique } = setup();

      await service.validate('t');

      expect(findUnique).toHaveBeenCalledWith({
        where: { tokenHash: sha256('t') },
      });
    });
  });

  describe('step and consumption', () => {
    it('advances the link to the next step', async () => {
      const { service, update } = setup();

      await service.setStep('link-1', 'AVAILABILITY');

      expect(update).toHaveBeenCalledWith({
        where: { id: 'link-1' },
        data: { step: 'AVAILABILITY' },
      });
    });

    it('consumes only a link that is still open', async () => {
      const { service, updateMany } = setup();

      await service.consume('link-1');

      expect(updateMany).toHaveBeenCalledWith({
        where: { id: 'link-1', consumedAt: null },
        data: { consumedAt: expect.any(Date) as Date },
      });
    });
  });

  describe('ttlHours', () => {
    it('defaults to 72 hours', () => {
      expect(setup().service.ttlHours()).toBe(72);
    });

    it('honors the configured value', () => {
      expect(
        setup({ AVAILABILITY_LINK_TTL_HOURS: '24' }).service.ttlHours(),
      ).toBe(24);
    });
  });
});
