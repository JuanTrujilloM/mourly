import { createHash } from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from './availability-link.service';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function setup() {
  const findUnique = jest.fn().mockResolvedValue(null);
  const update = jest.fn().mockResolvedValue({});
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });
  const prisma = {
    availabilityLink: { findUnique, update, updateMany },
  } as unknown as PrismaService;

  return {
    service: new AvailabilityLinkService(prisma),
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
});
