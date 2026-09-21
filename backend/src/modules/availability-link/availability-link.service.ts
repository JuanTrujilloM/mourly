import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../config/prisma.service';

// VENUE -> AVAILABILITY is the scheduling flow. DATE is the read-only link sent
// with the confirmation: it only opens the date page and never feeds the flow.
export type FlowStep = 'AVAILABILITY' | 'VENUE';
export type LinkStep = FlowStep | 'DATE';

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
const FLOW_TOKEN_BYTES = 32;
// 128 bits: still brute-force-proof, and 22 characters instead of 43 so the
// confirmation SMS stays in one GSM-7 segment with the link in it.
const DATE_TOKEN_BYTES = 16;

@Injectable()
export class AvailabilityLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  issueForMatchUser(
    matchId: string,
    userId: string,
    step: FlowStep = 'VENUE',
  ): Promise<string> {
    return this.replaceLink(matchId, userId, {
      step,
      tokenBytes: FLOW_TOKEN_BYTES,
      expiresAt: this.computeExpiry(),
    });
  }

  // Replaces the (already consumed) flow link: one row per user per match.
  issueDateLink(
    matchId: string,
    userId: string,
    expiresAt: Date,
  ): Promise<string> {
    return this.replaceLink(matchId, userId, {
      step: 'DATE',
      tokenBytes: DATE_TOKEN_BYTES,
      expiresAt,
    });
  }

  private async replaceLink(
    matchId: string,
    userId: string,
    link: { step: LinkStep; tokenBytes: number; expiresAt: Date },
  ): Promise<string> {
    const token = randomBytes(link.tokenBytes).toString('base64url');
    await this.prisma.availabilityLink.deleteMany({
      where: { matchId, userId },
    });
    await this.prisma.availabilityLink.create({
      data: {
        matchId,
        userId,
        step: link.step,
        tokenHash: this.hash(token),
        expiresAt: link.expiresAt,
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
