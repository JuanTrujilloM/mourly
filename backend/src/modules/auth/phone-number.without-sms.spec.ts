import { CELLPHONE, setupPhoneNumber } from './phone-number.test-helpers';

const setup = (current?: {
  cellphone: string | null;
  cellphoneVerifiedAt: Date | null;
}) => setupPhoneNumber({ current, smsVerification: 'false' });

describe('PhoneNumberService.assign with SMS verification off', () => {
  it('reads the switch from PHONE_SMS_VERIFICATION_ENABLED', () => {
    const { config } = setup();

    expect(config.get).toHaveBeenCalledWith('PHONE_SMS_VERIFICATION_ENABLED');
  });

  it('verifies the number as soon as it is saved', async () => {
    const { service, prisma } = setup();

    expect(await service.assign('u1', '3001112233')).toEqual({
      cellphone: CELLPHONE,
      cellphoneVerified: true,
    });
    const call = prisma.user.update.mock.calls[0][0] as {
      data: { cellphone: string; cellphoneVerifiedAt: Date };
    };
    expect(call.data.cellphone).toBe(CELLPHONE);
    expect(call.data.cellphoneVerifiedAt).toBeInstanceOf(Date);
  });

  it('verifies a number the account already had but never confirmed', async () => {
    const { service, prisma } = setup({
      cellphone: CELLPHONE,
      cellphoneVerifiedAt: null,
    });

    const result = await service.assign('u1', CELLPHONE);

    expect(result.cellphoneVerified).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('leaves an already verified number untouched', async () => {
    const { service, prisma } = setup({
      cellphone: CELLPHONE,
      cellphoneVerifiedAt: new Date(),
    });

    expect(await service.assign('u1', CELLPHONE)).toEqual({
      cellphone: CELLPHONE,
      cellphoneVerified: true,
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
