import { Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AdminReviewAccountService } from './admin-review-account.service';

const REVIEW_ACCOUNTS = { isReviewAccount: true };

function setup() {
  const prisma = {
    refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
    profile: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    emailVerificationCode: {
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  const service = new AdminReviewAccountService(
    prisma as unknown as PrismaService,
  );
  return { service, prisma };
}

describe('AdminReviewAccountService.close', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete process.env.REVIEW_ACCOUNT_EMAIL;
    delete process.env.REVIEW_ACCOUNT_CODE;
    jest.restoreAllMocks();
  });

  it('revokes sessions, pauses the profile and drops pending codes in one transaction', async () => {
    const { service, prisma } = setup();

    const result = await service.close();

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { user: REVIEW_ACCOUNTS, revokedAt: null },
      data: { revokedAt: expect.any(Date) as Date },
    });
    expect(prisma.profile.updateMany).toHaveBeenCalledWith({
      where: { user: REVIEW_ACCOUNTS },
      data: { status: 'PAUSED' },
    });
    expect(prisma.emailVerificationCode.deleteMany).toHaveBeenCalledWith({
      where: { user: REVIEW_ACCOUNTS, consumedAt: null },
    });
    expect(result).toEqual({
      revokedSessions: 2,
      pausedProfiles: 1,
      retiredCodes: 1,
      reviewLoginStillOpen: false,
    });
  });

  it('warns the admin while the review env vars still let the reviewer back in', async () => {
    process.env.REVIEW_ACCOUNT_EMAIL = 'revision@mourly.com';
    process.env.REVIEW_ACCOUNT_CODE = '482913';
    const { service } = setup();

    expect((await service.close()).reviewLoginStillOpen).toBe(true);
  });
});
