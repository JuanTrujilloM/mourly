import { HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';

function setup(secondsLeft = 0) {
  const codes = {
    issueForUser: jest.fn().mockResolvedValue('123456'),
    getSecondsUntilResendAllowed: jest.fn().mockResolvedValue(secondsLeft),
  };
  const mail = { sendVerificationCode: jest.fn().mockResolvedValue(undefined) };

  const service = new VerificationDeliveryService(
    codes as unknown as VerificationCodeService,
    mail as unknown as MailService,
  );
  return { service, codes, mail };
}

describe('VerificationDeliveryService', () => {
  it('issues a code and mails it', async () => {
    const { service, codes, mail } = setup();

    await service.send('u1', 'ana@eafit.edu.co');

    expect(codes.issueForUser).toHaveBeenCalledWith('u1');
    expect(mail.sendVerificationCode).toHaveBeenCalledWith(
      'ana@eafit.edu.co',
      '123456',
    );
  });

  describe('sendIfCooldownElapsed', () => {
    it('sends when the cooldown has elapsed', async () => {
      const { service, mail } = setup(0);

      await service.sendIfCooldownElapsed('u1', 'ana@eafit.edu.co');

      expect(mail.sendVerificationCode).toHaveBeenCalled();
    });

    it('stays silent while the cooldown is active', async () => {
      const { service, mail } = setup(30);

      await service.sendIfCooldownElapsed('u1', 'ana@eafit.edu.co');

      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });
  });

  describe('sendOrThrowCooldown', () => {
    it('sends when the cooldown has elapsed', async () => {
      const { service, mail } = setup(0);

      await service.sendOrThrowCooldown('u1', 'ana@eafit.edu.co');

      expect(mail.sendVerificationCode).toHaveBeenCalled();
    });

    it('reports the remaining wait as 429', async () => {
      const { service, mail } = setup(42);

      const failure = await service
        .sendOrThrowCooldown('u1', 'ana@eafit.edu.co')
        .catch((error: HttpException) => error);

      expect(failure).toBeInstanceOf(HttpException);
      expect((failure as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
      expect((failure as HttpException).message).toContain('42');
      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });
  });
});
