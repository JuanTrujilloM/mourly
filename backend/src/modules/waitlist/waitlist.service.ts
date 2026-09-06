import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UniversitiesService } from '../universities/universities.service';
import { getEmailDomain } from '../universities/email-domain';
import { normalizeEmail } from '../auth/utils/normalize-email';
import { ALREADY_SUPPORTED_MESSAGE, JOINED_MESSAGE } from './waitlist.messages';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly universities: UniversitiesService,
  ) {}

  async join(dto: JoinWaitlistDto): Promise<{ message: string }> {
    const email = normalizeEmail(dto.email);
    if (await this.universities.isSupportedEmail(email)) {
      throw new BadRequestException(ALREADY_SUPPORTED_MESSAGE);
    }

    const contact = { name: dto.name.trim(), cellphone: dto.cellphone };
    await this.prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, domain: getEmailDomain(email), ...contact },
      update: contact,
    });
    return { message: JOINED_MESSAGE };
  }

  findAll() {
    return this.prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
