import { PrismaService } from '../../config/prisma.service';
import { PhoneNumberService } from './phone-number.service';
import { CELLPHONE_TAKEN_MESSAGE } from './phone-verification.messages';
import { UserLookupService } from './user-lookup.service';
import { MAX_ATTEMPTS } from './verification-code.service';

const CELLPHONE = '+573001112233';

function setup(currentCellphone: string | null = null) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ cellphone: currentCellphone }),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    phoneVerificationCode: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  const users = {
    isCellphoneVerifiedByAnother: jest.fn().mockResolvedValue(false),
  };
  const service = new PhoneNumberService(
    prisma as unknown as PrismaService,
    users as unknown as UserLookupService,
  );
  return { service, prisma, users };
}

describe('PhoneNumberService.assign', () => {
  it('stores the number in E.164 and resets the verification', async () => {
    const { service, prisma } = setup();

    expect(await service.assign('u1', '300 111 2233')).toEqual({
      cellphone: CELLPHONE,
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { cellphone: CELLPHONE, cellphoneVerifiedAt: null },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('exhausts pending codes instead of deleting them, so the cooldown survives', async () => {
    const { service, prisma } = setup();

    await service.assign('u1', CELLPHONE);

    expect(prisma.phoneVerificationCode.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', consumedAt: null },
      data: { attempts: MAX_ATTEMPTS },
    });
  });

  it('takes the number away from accounts that never verified it', async () => {
    const { service, prisma } = setup();

    await service.assign('u1', CELLPHONE);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: {
        cellphone: CELLPHONE,
        cellphoneVerifiedAt: null,
        id: { not: 'u1' },
      },
      data: { cellphone: null },
    });
  });

  it('changes nothing when the number is already the current one', async () => {
    const { service, prisma, users } = setup(CELLPHONE);

    expect(await service.assign('u1', '3001112233')).toEqual({
      cellphone: CELLPHONE,
    });
    expect(users.isCellphoneVerifiedByAnother).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('refuses a number another account verified', async () => {
    const { service, users, prisma } = setup();
    users.isCellphoneVerifiedByAnother.mockResolvedValue(true);

    await expect(service.assign('u1', '3001112233')).rejects.toThrow(
      CELLPHONE_TAKEN_MESSAGE,
    );
    expect(users.isCellphoneVerifiedByAnother).toHaveBeenCalledWith(
      CELLPHONE,
      'u1',
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
