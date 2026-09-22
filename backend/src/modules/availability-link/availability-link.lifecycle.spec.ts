import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from './availability-link.service';

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

describe('AvailabilityLinkService', () => {
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
});
