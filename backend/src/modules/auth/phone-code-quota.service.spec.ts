import { PrismaService } from '../../config/prisma.service';
import {
  DAILY_PHONE_CODE_LIMIT,
  PhoneCodeQuotaService,
} from './phone-code-quota.service';

function setup(issued: number) {
  const count = jest.fn().mockResolvedValue(issued);
  const prisma = {
    phoneVerificationCode: { count },
  } as unknown as PrismaService;
  return { service: new PhoneCodeQuotaService(prisma), count };
}

describe('PhoneCodeQuotaService', () => {
  it('counts every code issued to the user in the last 24 hours', async () => {
    const { service, count } = setup(0);
    const now = new Date('2026-09-18T12:00:00Z');

    await service.hasRemaining('u1', now);

    expect(count).toHaveBeenCalledWith({
      where: {
        userId: 'u1',
        createdAt: { gte: new Date('2026-09-17T12:00:00Z') },
      },
    });
  });

  it('allows another code below the daily limit', async () => {
    const { service } = setup(DAILY_PHONE_CODE_LIMIT - 1);

    expect(await service.hasRemaining('u1')).toBe(true);
  });

  it('refuses once the daily limit is reached', async () => {
    const { service } = setup(DAILY_PHONE_CODE_LIMIT);

    expect(await service.hasRemaining('u1')).toBe(false);
  });
});
