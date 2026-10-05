import { MailService } from '../mail/mail.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';
import { VerificationDeliveryService } from './verification-delivery.service';

function setup(issued: string | null) {
  const issuer = {
    issueIfAllowed: jest.fn().mockResolvedValue(issued),
    ttlMinutes: 10,
  };
  const mail = { sendVerificationCode: jest.fn().mockResolvedValue(undefined) };

  const service = new VerificationDeliveryService(
    issuer as unknown as VerificationCodeIssuerService,
    mail as unknown as MailService,
  );
  return { service, issuer, mail };
}

describe('VerificationDeliveryService', () => {
  it('mails the code the issuer granted', async () => {
    const { service, issuer, mail } = setup('123456');

    await service.sendIfAllowed('u1', 'ana@eafit.edu.co');

    expect(issuer.issueIfAllowed).toHaveBeenCalledWith('u1');
    expect(mail.sendVerificationCode).toHaveBeenCalledWith(
      'ana@eafit.edu.co',
      '123456',
      10,
    );
  });

  it('stays silent when the issuer refuses', async () => {
    const { service, mail } = setup(null);

    await service.sendIfAllowed('u1', 'ana@eafit.edu.co');

    expect(mail.sendVerificationCode).not.toHaveBeenCalled();
  });

  describe('for the review account', () => {
    beforeEach(() => {
      process.env.REVIEW_ACCOUNT_EMAIL = 'revision@mourly.com';
      process.env.REVIEW_ACCOUNT_CODE = '482913';
    });

    afterEach(() => {
      delete process.env.REVIEW_ACCOUNT_EMAIL;
      delete process.env.REVIEW_ACCOUNT_CODE;
    });

    it('issues the fixed code and mails nothing, since nobody reads that inbox', async () => {
      const { service, issuer, mail } = setup('482913');

      await service.sendIfAllowed('u1', 'revision@mourly.com');

      expect(issuer.issueIfAllowed).toHaveBeenCalledWith('u1', '482913');
      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('keeps mailing a random code to everyone else', async () => {
      const { service, issuer, mail } = setup('123456');

      await service.sendIfAllowed('u1', 'ana@eafit.edu.co');

      expect(issuer.issueIfAllowed).toHaveBeenCalledWith('u1');
      expect(mail.sendVerificationCode).toHaveBeenCalledWith(
        'ana@eafit.edu.co',
        '123456',
        10,
      );
    });
  });
});
