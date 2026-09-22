import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import {
  DATE_TOKEN_BYTES,
  FLOW_TOKEN_BYTES,
  hashToken,
  mintToken,
  type FlowStep,
  type LinkStep,
} from './link-token';

const DEFAULT_TTL_HOURS = 72;

@Injectable()
export class AvailabilityLinkIssuerService {
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

  ttlHours(): number {
    return Number(
      this.config.get<string>('AVAILABILITY_LINK_TTL_HOURS') ??
        DEFAULT_TTL_HOURS,
    );
  }

  private async replaceLink(
    matchId: string,
    userId: string,
    link: { step: LinkStep; tokenBytes: number; expiresAt: Date },
  ): Promise<string> {
    const token = mintToken(link.tokenBytes);
    await this.prisma.availabilityLink.deleteMany({
      where: { matchId, userId },
    });
    await this.prisma.availabilityLink.create({
      data: {
        matchId,
        userId,
        step: link.step,
        tokenHash: hashToken(token),
        expiresAt: link.expiresAt,
      },
    });
    return token;
  }

  private computeExpiry(): Date {
    return new Date(Date.now() + this.ttlHours() * 60 * 60 * 1000);
  }
}
