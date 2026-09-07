import { ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { VerificationResendPolicyService } from './verification-resend-policy.service';

function setup(secondsLeft = 0, exhausted = false) {
  const codes = { issueForUser: jest.fn().mockResolvedValue('123456') };
  const mail = { sendVerificationCode: jest.fn().mockResolvedValue(undefined) };
  const resendPolicy = {
    getSecondsUntilResendAllowed: jest.fn().mockResolvedValue(secondsLeft),
    hasExhaustedResends: jest.fn().mockResolvedValue(exhausted),
  };

  const service = new VerificationDeliveryService(
    codes as unknown as VerificationCodeService,
    mail as unknown as MailService,
    resendPolicy as unknown as VerificationResendPolicyService,
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

  describe('sendOrThrow', () => {
    it('sends when the cooldown has elapsed', async () => {
      const { service, mail } = setup(0);

      await service.sendOrThrow('u1', 'ana@eafit.edu.co');

      expect(mail.sendVerificationCode).toHaveBeenCalled();
    });

    it('reports the remaining wait as 429', async () => {
      const { service, mail } = setup(42);

      const failure = await service
        .sendOrThrow('u1', 'ana@eafit.edu.co')
        .catch((error: HttpException) => error);

      expect(failure).toBeInstanceOf(HttpException);
      expect((failure as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
      expect((failure as HttpException).getResponse()).toMatchObject({
        retryAfterSeconds: 42,
      });
      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('reports a spent resend limit as 403 before the cooldown', async () => {
      const { service, mail } = setup(42, true);

      const failure = await service
        .sendOrThrow('u1', 'ana@eafit.edu.co')
        .catch((error: HttpException) => error);

      expect(failure).toBeInstanceOf(ForbiddenException);
      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });
  });
});
