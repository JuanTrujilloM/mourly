import { BadRequestException } from '@nestjs/common';
import { CELLPHONE_TAKEN_MESSAGE } from './phone-verification.messages';
import { setupPhoneVerification as setup } from './test-helpers';

describe('PhoneVerificationService', () => {
  describe('updateCellphone', () => {
    it('stores the number in E.164 and resets the verification', async () => {
      const { service, prisma } = setup();

      expect(await service.updateCellphone('u1', '300 111 2233')).toEqual({
        cellphone: '+573001112233',
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { cellphone: '+573001112233', cellphoneVerifiedAt: null },
      });
      expect(prisma.phoneVerificationCode.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', consumedAt: null },
      });
    });

    it('refuses a number that belongs to another account', async () => {
      const { service, users, prisma } = setup();
      users.isCellphoneTaken.mockResolvedValue(true);

      await expect(service.updateCellphone('u1', '3001112233')).rejects.toThrow(
        CELLPHONE_TAKEN_MESSAGE,
      );
      expect(users.isCellphoneTaken).toHaveBeenCalledWith(
        '+573001112233',
        'u1',
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    it('stamps the verification and returns the safe user', async () => {
      const { service, prisma, safeUsers } = setup();

      const user = await service.verify('u1', '482913');

      expect(user).toEqual({ id: 'u1', cellphoneVerified: true });
      expect(safeUsers.getById).toHaveBeenCalledWith('u1');
      const call = prisma.user.update.mock.calls[0][0] as {
        data: { cellphoneVerifiedAt: Date };
      };
      expect(call.data.cellphoneVerifiedAt).toBeInstanceOf(Date);
    });

    it('rejects a wrong code without stamping', async () => {
      const { service, codes, prisma } = setup();
      codes.validate.mockResolvedValue('mismatch');

      await expect(service.verify('u1', '000000')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
