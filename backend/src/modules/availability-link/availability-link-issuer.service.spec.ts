import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkIssuerService } from './availability-link-issuer.service';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function setup(env: Record<string, string> = {}) {
  const create = jest.fn().mockResolvedValue({ id: 'link-1' });
  const deleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const prisma = {
    availabilityLink: { create, deleteMany },
  } as unknown as PrismaService;
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;

  return {
    service: new AvailabilityLinkIssuerService(prisma, config),
    create,
    deleteMany,
  };
}

describe('AvailabilityLinkIssuerService', () => {
  describe('issueDateLink', () => {
    const EXPIRES_AT = new Date('2026-09-23T17:00:00Z');

    it('issues a DATE link that lives until the given moment', async () => {
      const { service, create } = setup();

      await service.issueDateLink('m1', 'u1', EXPIRES_AT);

      expect(create.mock.calls[0][0].data).toMatchObject({
        matchId: 'm1',
        userId: 'u1',
        step: 'DATE',
        expiresAt: EXPIRES_AT,
      });
    });

    it('uses a 22-character token and stores only its hash', async () => {
      const { service, create } = setup();

      const token = await service.issueDateLink('m1', 'u1', EXPIRES_AT);

      expect(token).toHaveLength(22);
      expect(create.mock.calls[0][0].data.tokenHash).toBe(sha256(token));
    });

    it('replaces the flow link of the same match and user', async () => {
      const { service, deleteMany } = setup();

      await service.issueDateLink('m1', 'u1', EXPIRES_AT);

      expect(deleteMany).toHaveBeenCalledWith({
        where: { matchId: 'm1', userId: 'u1' },
      });
    });
  });

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
});
