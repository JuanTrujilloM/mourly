import { ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { setupVerificationDelivery as setup } from './test-helpers';

describe('VerificationDeliveryService.sendOrThrow', () => {
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
