import { BadRequestException } from '@nestjs/common';
import { setupPhoneVerification as setup } from './test-helpers';

describe('PhoneVerificationService', () => {
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
