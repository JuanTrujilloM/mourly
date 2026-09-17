import { MailService } from '../mail/mail.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { VerificationResendPolicyService } from './verification-resend-policy.service';

export function setupVerificationDelivery(secondsLeft = 0, exhausted = false) {
  const codes = {
    issueForUser: jest.fn().mockResolvedValue('123456'),
    ttlMinutes: 10,
  };
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
