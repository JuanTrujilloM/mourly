import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { SessionService, type Session } from './session.service';
import { SafeUserService, type SafeUser } from './safe-user.service';
import { UserLookupService } from './user-lookup.service';
import { normalizeEmail } from './utils/normalize-email';
import { NEUTRAL_MESSAGE, type Acknowledgement } from './auth.messages';
import {
  INVALID_CODE_MESSAGE,
  messageForVerificationResult,
} from './verification-messages';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codes: VerificationCodeService,
    private readonly delivery: VerificationDeliveryService,
    private readonly sessions: SessionService,
    private readonly safeUsers: SafeUserService,
    private readonly users: UserLookupService,
  ) {}

  async login(dto: LoginDto): Promise<Acknowledgement> {
    const email = normalizeEmail(dto.email);
    const user = await this.users.findByEmail(email);
    if (user) {
      await this.delivery.sendIfCooldownElapsed(user.id, email);
    }
    return { message: NEUTRAL_MESSAGE };
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

  async resend(dto: ResendCodeDto): Promise<Acknowledgement> {
    const email = normalizeEmail(dto.email);
    const user = await this.users.findByEmail(email);
    if (user && !(await this.codes.hasVerifiedEmail(user.id))) {
      await this.delivery.sendOrThrowCooldown(user.id, email);
    }
    return { message: NEUTRAL_MESSAGE };
  }

  getById(userId: string): Promise<SafeUser> {
    return this.safeUsers.getById(userId);
  }
}
