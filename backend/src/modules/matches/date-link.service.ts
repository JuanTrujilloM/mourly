import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
// The page stays open a day after the date, then the link dies with it.
const GRACE_HOURS_AFTER_DATE = 24;
const MS_PER_HOUR = 60 * 60 * 1000;

@Injectable()
export class DateLinkService {
  private readonly logger = new Logger(DateLinkService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly links: AvailabilityLinkService,
  ) {}

  // null instead of throwing: a date that is already saved must still be
  // announced, with or without its link.
  async urlFor(
    matchId: string,
    userId: string,
    scheduledAt: Date,
  ): Promise<string | null> {
    try {
      const expiresAt = new Date(
        scheduledAt.getTime() + GRACE_HOURS_AFTER_DATE * MS_PER_HOUR,
      );
      const token = await this.links.issueDateLink(matchId, userId, expiresAt);
      return `${this.frontendUrl()}/cita/${token}`;
    } catch (error) {
      this.logger.error(
        `Failed to issue the date link for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return null;
    }
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL;
  }
}
