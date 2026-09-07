import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerLimitDetail } from '@nestjs/throttler';

const TOO_MANY_REQUESTS_MESSAGE =
  'Estás yendo muy rápido. Esperá un momento y volvé a intentarlo.';

@Injectable()
export class FriendlyThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(
    _context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new HttpException(
      {
        message: TOO_MANY_REQUESTS_MESSAGE,
        retryAfterSeconds: Math.max(1, Math.ceil(detail.timeToExpire)),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
