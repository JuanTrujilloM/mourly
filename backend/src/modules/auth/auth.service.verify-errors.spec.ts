import { BadRequestException } from '@nestjs/common';
import { setupAuthService as setup } from './test-helpers';
import {
  INVALID_CODE_MESSAGE,
  TOO_MANY_ATTEMPTS_MESSAGE,
} from './verification-messages';

describe('AuthService.verify failures', () => {
  it('answers like a wrong code when the email is unknown', async () => {
    const { service, users } = setup();
    users.findByEmail.mockResolvedValue(null);

    await expect(
      service.verify({ email: 'ghost@eafit.edu.co', code: '123456' }),
    ).rejects.toThrow(INVALID_CODE_MESSAGE);
  });

  it('reports a lockout after too many attempts', async () => {
    const { service, codes } = setup();
    codes.validate.mockResolvedValue('too_many_attempts');

    await expect(
      service.verify({ email: 'ana@eafit.edu.co', code: '000000' }),
    ).rejects.toThrow(TOO_MANY_ATTEMPTS_MESSAGE);
  });

  it('uses the same message for a wrong and an expired code', async () => {
    const wrong = setup();
    wrong.codes.validate.mockResolvedValue('mismatch');
    const expired = setup();
    expired.codes.validate.mockResolvedValue('expired');

    const attempt = (harness: ReturnType<typeof setup>) =>
      harness.service
        .verify({ email: 'ana@eafit.edu.co', code: '000000' })
        .catch((error: BadRequestException) => error.message);

    expect(await attempt(wrong)).toBe(await attempt(expired));
  });
});
