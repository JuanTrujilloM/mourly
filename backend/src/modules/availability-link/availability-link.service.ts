import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../config/prisma.service';

export type LinkStep = 'AVAILABILITY' | 'VENUE';

export interface ValidatedLink {
  id: string;
  matchId: string;
  userId: string;
  step: LinkStep;
}

export type LinkValidation =
  | { status: 'ok'; link: ValidatedLink }
  | { status: 'invalid' | 'expired' | 'consumed' };

const DEFAULT_TTL_HOURS = 72;

@Injectable()
export class AvailabilityLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async issueForMatchUser(
    matchId: string,
    userId: string,
    step: LinkStep = 'VENUE',
  ): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.availabilityLink.deleteMany({
      where: { matchId, userId },
    });
    await this.prisma.availabilityLink.create({
      data: {
        matchId,
        userId,
        step,
        tokenHash: this.hash(token),
        expiresAt: this.computeExpiry(),
      },
    });
    return token;
  }

  async validate(token: string): Promise<LinkValidation> {
    const record = await this.prisma.availabilityLink.findUnique({
      where: { tokenHash: this.hash(token) },
    });

    if (!record) return { status: 'invalid' };
    if (record.consumedAt) return { status: 'consumed' };
    if (record.expiresAt.getTime() < Date.now()) return { status: 'expired' };

    return {
      status: 'ok',
      link: {
        id: record.id,
        matchId: record.matchId,
        userId: record.userId,
        step: record.step as LinkStep,
      },
    };
  }

  async setStep(linkId: string, step: LinkStep): Promise<void> {
    await this.prisma.availabilityLink.update({
      where: { id: linkId },
      data: { step },
    });
  }

  async consume(linkId: string): Promise<void> {
    await this.prisma.availabilityLink.updateMany({
      where: { id: linkId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  ttlHours(): number {
    return Number(
      this.config.get<string>('AVAILABILITY_LINK_TTL_HOURS') ??
        DEFAULT_TTL_HOURS,
    );
  }

  private computeExpiry(): Date {
    return new Date(Date.now() + this.ttlHours() * 60 * 60 * 1000);
  }
}
