import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UniversitiesService } from '../universities/universities.service';
import { getEmailDomain } from '../universities/email-domain';
import { normalizeEmail } from '../auth/utils/normalize-email';
import { ALREADY_SUPPORTED_MESSAGE, JOINED_MESSAGE } from './waitlist.messages';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { DEFAULT_PAGE_SIZE, ListWaitlistDto } from './dto/list-waitlist.dto';

const WAITLIST_ENTRY_SELECT = {
  id: true,
  name: true,
  email: true,
  cellphone: true,
  domain: true,
  createdAt: true,
} as const;

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

  async findPage({ take = DEFAULT_PAGE_SIZE, cursor }: ListWaitlistDto) {
    const rows = await this.prisma.waitlistEntry.findMany({
      select: WAITLIST_ENTRY_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });
    const items = rows.slice(0, take);
    const nextCursor = rows.length > take ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }
}
