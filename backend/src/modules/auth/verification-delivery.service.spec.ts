import { setupVerificationDelivery as setup } from './test-helpers';

describe('VerificationDeliveryService', () => {
  it('issues a code and mails it with its time to live', async () => {
    const { service, codes, mail } = setup();

    await service.send('u1', 'ana@eafit.edu.co');

    expect(codes.issueForUser).toHaveBeenCalledWith('u1');
    expect(mail.sendVerificationCode).toHaveBeenCalledWith(
      'ana@eafit.edu.co',
      '123456',
      10,
    );
  });

  describe('sendIfAllowed', () => {
    it('sends when the cooldown has elapsed', async () => {
      const { service, mail } = setup(0);

      await service.sendIfAllowed('u1', 'ana@eafit.edu.co');

      expect(mail.sendVerificationCode).toHaveBeenCalled();
    });

    it('stays silent while the cooldown is active', async () => {
      const { service, mail } = setup(30);

      await service.sendIfAllowed('u1', 'ana@eafit.edu.co');

      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('stays silent once the resend limit is spent', async () => {
      const { service, mail } = setup(0, true);

      await service.sendIfAllowed('u1', 'ana@eafit.edu.co');

      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });
  });
});
