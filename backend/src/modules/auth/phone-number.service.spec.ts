import {
  CELLPHONE,
  setupPhoneNumber as setup,
} from './phone-number.test-helpers';
import { CELLPHONE_TAKEN_MESSAGE } from './phone-verification.messages';
import { MAX_ATTEMPTS } from './verification-code.service';

const CURRENT = { cellphone: CELLPHONE, cellphoneVerifiedAt: null };

describe('PhoneNumberService.assign', () => {
  it('stores the number in E.164 and resets the verification', async () => {
    const { service, prisma } = setup();

    expect(await service.assign('u1', '300 111 2233')).toEqual({
      cellphone: CELLPHONE,
      cellphoneVerified: false,
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
    const { service, prisma, users } = setup({ current: CURRENT });

    expect(await service.assign('u1', '3001112233')).toEqual({
      cellphone: CELLPHONE,
      cellphoneVerified: false,
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
