import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { hashToken, type FlowStep, type LinkStep } from './link-token';

export interface ValidatedLink {
  id: string;
  matchId: string;
  userId: string;
  step: LinkStep;
}

export type LinkValidation =
  | { status: 'ok'; link: ValidatedLink }
  | { status: 'invalid' | 'expired' | 'consumed' };

@Injectable()
export class AvailabilityLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(token: string): Promise<LinkValidation> {
    const record = await this.prisma.availabilityLink.findUnique({
      where: { tokenHash: hashToken(token) },
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

  async setStep(linkId: string, step: FlowStep): Promise<void> {
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
}
