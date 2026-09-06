import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { UserLookupService } from './user-lookup.service';
import { UniversitiesService } from '../universities/universities.service';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '../universities/university-messages';
import { normalizeEmail } from './utils/normalize-email';
import { NEUTRAL_MESSAGE, type Acknowledgement } from './auth.messages';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codes: VerificationCodeService,
    private readonly delivery: VerificationDeliveryService,
    private readonly users: UserLookupService,
    private readonly universities: UniversitiesService,
  ) {}

  async register(dto: RegisterDto): Promise<Acknowledgement> {
    const email = normalizeEmail(dto.email);
    if (!(await this.universities.isSupportedEmail(email))) {
      throw new BadRequestException(UNSUPPORTED_UNIVERSITY_MESSAGE);
    }

    const existing = await this.users.findByEmail(email);
    if (existing && (await this.codes.hasVerifiedEmail(existing.id))) {
      await this.delivery.sendIfCooldownElapsed(existing.id, email);
      return { message: NEUTRAL_MESSAGE };
    }
    if (await this.users.isCellphoneTaken(dto.cellphone, existing?.id)) {
      return { message: NEUTRAL_MESSAGE };
    }

    const user = await this.upsertUser(email, dto.cellphone, existing?.id);
    await this.delivery.send(user.id, email);
    return { message: NEUTRAL_MESSAGE };
  }

  private upsertUser(email: string, cellphone: string, existingId?: string) {
    return existingId
      ? this.prisma.user.update({
          where: { id: existingId },
          data: { cellphone },
        })
      : this.prisma.user.create({ data: { email, cellphone } });
  }
}
