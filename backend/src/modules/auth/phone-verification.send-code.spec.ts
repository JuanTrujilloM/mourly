import { HttpException } from '@nestjs/common';
import {
  ALREADY_VERIFIED_MESSAGE,
  CELLPHONE_REQUIRED_MESSAGE,
  TOO_MANY_CODES_MESSAGE,
} from './phone-verification.messages';
import { setupPhoneVerification as setup } from './test-helpers';

describe('PhoneVerificationService.sendCode', () => {
  it('texts the code to the pending number', async () => {
    const { service, sms } = setup();

    await service.sendCode('u1');

    const send = jest.mocked(sms.send);
    expect(send).toHaveBeenCalledWith(
      '+573001112233',
      expect.stringContaining('482913'),
    );
    expect(send.mock.calls[0][1]).toContain('10 minutos');
  });

  it('requires a number first', async () => {
    const { service, sms } = setup({
      cellphone: null,
      cellphoneVerifiedAt: null,
    });

    await expect(service.sendCode('u1')).rejects.toThrow(
      CELLPHONE_REQUIRED_MESSAGE,
    );
    expect(sms.send).not.toHaveBeenCalled();
  });

  it('refuses once the number is verified', async () => {
    const { service } = setup({
      cellphone: '+57300',
      cellphoneVerifiedAt: new Date(),
    });

    await expect(service.sendCode('u1')).rejects.toThrow(
      ALREADY_VERIFIED_MESSAGE,
    );
  });

  it('answers 429 when the issuer refuses', async () => {
    const { service, issuer, sms } = setup();
    issuer.issueIfAllowed.mockResolvedValue(null);

    const failure = await service
      .sendCode('u1')
      .catch((error: HttpException) => error);

    expect(failure).toBeInstanceOf(HttpException);
    expect((failure as HttpException).getStatus()).toBe(429);
    expect((failure as HttpException).message).toBe(TOO_MANY_CODES_MESSAGE);
    expect(sms.send).not.toHaveBeenCalled();
  });
});
