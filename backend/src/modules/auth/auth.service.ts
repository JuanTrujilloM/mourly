import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDispatcherService } from './verification-dispatcher.service';
import { SessionService, type Session } from './session.service';
import { SafeUserService, type SafeUser } from './safe-user.service';
import { UserLookupService } from './user-lookup.service';
import { normalizeEmail } from './utils/normalize-email';
import { CODE_SENT_MESSAGE, type Acknowledgement } from './auth.messages';
import {
  INVALID_CODE_MESSAGE,
  messageForVerificationResult,
} from './verification-messages';
import { EMAIL_CODE_VALIDATOR } from './verification.tokens';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_CODE_VALIDATOR)
    private readonly codes: VerificationCodeService,
    private readonly dispatcher: VerificationDispatcherService,
    private readonly sessions: SessionService,
    private readonly safeUsers: SafeUserService,
    private readonly users: UserLookupService,
  ) {}

  async requestCode(dto: RequestCodeDto): Promise<Acknowledgement> {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    this.dispatcher.dispatch(user.id, email);
    return { message: CODE_SENT_MESSAGE };
  }

  async verify(dto: VerifyCodeDto): Promise<Session> {
    const user = await this.users.findByEmail(normalizeEmail(dto.email));
    if (!user) {
      throw new BadRequestException(INVALID_CODE_MESSAGE);
    }

    const result = await this.codes.validate(user.id, dto.code);
    if (result !== 'ok') {
      throw new BadRequestException(messageForVerificationResult(result));
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
    return this.sessions.issueFor(user.id, user.email);
  }

  getById(userId: string): Promise<SafeUser> {
    return this.safeUsers.getById(userId);
  }
}
