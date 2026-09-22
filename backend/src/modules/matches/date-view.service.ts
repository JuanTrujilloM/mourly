import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { toPartnerSummary } from './partner.mapper';
import { sharedHobbyNames } from './shared-hobbies';

const EXPIRED_MESSAGE = 'Este enlace ya expiró.';
const INVALID_MESSAGE = 'Este enlace no es válido.';
const NO_DATE_MESSAGE = 'Esta cita ya no está agendada.';

const PROFILE_SELECTION = {
  select: {
    profile: {
      select: {
        name: true,
        dateOfBirth: true,
        university: true,
        major: true,
        biography: true,
        photos: { select: { url: true, isPrimary: true } },
        hobbies: { select: { hobby: { select: { name: true } } } },
      },
    },
  },
};

const DATE_VIEW_SELECTION = {
  userAId: true,
  userA: PROFILE_SELECTION,
  userB: PROFILE_SELECTION,
  date: {
    select: {
      scheduledAt: true,
      venue: { select: { name: true, address: true } },
    },
  },
};

// Read-only page behind the confirmation SMS. The partner fields are the ones
// the app already shows to a matched user; nothing here changes the match.
@Injectable()
export class DateViewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly links: AvailabilityLinkService,
  ) {}

  async getView(token: string) {
    const link = await this.resolveDateLink(token);
    const match = await this.prisma.match.findUnique({
      where: { id: link.matchId },
      select: DATE_VIEW_SELECTION,
    });

    const [viewer, other] =
      match?.userAId === link.userId
        ? [match.userA, match.userB]
        : [match?.userB, match?.userA];
    const partner = toPartnerSummary(other ?? null);
    if (!match?.date || !partner) {
      throw new GoneException(NO_DATE_MESSAGE);
    }

    return {
      viewer: {
        name: viewer?.profile?.name ?? null,
        university: viewer?.profile?.university ?? null,
      },
      partner,
      venue: match.date.venue,
      scheduledAt: match.date.scheduledAt.toISOString(),
      sharedHobbies: sharedHobbyNames(viewer ?? null, other ?? null),
    };
  }

  // A flow link (VENUE / AVAILABILITY) is not a pass to this page.
  private async resolveDateLink(token: string) {
    const result = await this.links.validate(token);
    if (result.status === 'expired') {
      throw new GoneException(EXPIRED_MESSAGE);
    }
    if (result.status !== 'ok' || result.link.step !== 'DATE') {
      throw new NotFoundException(INVALID_MESSAGE);
    }
    return result.link;
  }
}
