import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkIssuerService } from './availability-link-issuer.service';

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
