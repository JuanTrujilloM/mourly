import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import type { ThrottlerLimitDetail } from '@nestjs/throttler';
import { FriendlyThrottlerGuard } from './friendly-throttler.guard';

class ExposedGuard extends FriendlyThrottlerGuard {
  reject(timeToExpire: number): Promise<void> {
    return this.throwThrottlingException(
      {} as ExecutionContext,
      { timeToExpire } as ThrottlerLimitDetail,
    );
  }
}

async function reject(timeToExpire: number): Promise<HttpException> {
  const guard = Object.create(ExposedGuard.prototype) as ExposedGuard;
  try {
    await guard.reject(timeToExpire);
  } catch (error) {
    return error as HttpException;
  }
  throw new Error('expected a rejection');
}

describe('FriendlyThrottlerGuard', () => {
  it('answers 429 without leaking the exception class name', async () => {
    const failure = await reject(30);

    expect(failure.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(failure.getResponse()).toEqual({
      message:
        'Estás yendo muy rápido. Esperá un momento y volvé a intentarlo.',
      retryAfterSeconds: 30,
    });
  });

  it('rounds a fractional wait up so the client never retries too soon', async () => {
    expect((await reject(12.2)).getResponse()).toMatchObject({
      retryAfterSeconds: 13,
    });
  });

  it('always asks for at least one second', async () => {
    expect((await reject(0)).getResponse()).toMatchObject({
      retryAfterSeconds: 1,
    });
  });
});
