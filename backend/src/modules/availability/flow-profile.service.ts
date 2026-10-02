import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { isActiveStatus } from '../matches/match-scheduling';
import { otherHobbyNames, sharedHobbyNames } from '../matches/shared-hobbies';
import { PhotoUrlService } from '../storage/photo-url.service';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';
import {
  FLOW_PARTNER_SELECTION,
  FlowPartner,
  toFlowPartner,
} from './flow-partner.mapper';

const INVALID_MESSAGE = 'Este enlace no es válido.';
const CLOSED_MESSAGE = 'Este enlace ya expiró.';

export type FlowProfileView =
  | { step: 'COMPLETED' }
  | {
      step: 'VENUE' | 'AVAILABILITY';
      partner: FlowPartner;
      sharedHobbies: string[];
      otherHobbies: string[];
    };

// The screen behind the match SMS, before places and hours. Same fields the
// app shows a matched user, but only the first name: the surname waits for a
// confirmed plan. Read-only: nothing here moves the link or the match.
@Injectable()
export class FlowProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: AvailabilityLinkResolver,
    private readonly photoUrls: PhotoUrlService,
  ) {}

  async getProfileView(token: string): Promise<FlowProfileView> {
    const link = await this.resolver.resolveForView(token);
    if (!link || link.step === 'DATE') {
      return { step: 'COMPLETED' };
    }

    const match = await this.prisma.match.findUnique({
      where: { id: link.matchId },
      select: {
        userAId: true,
        status: true,
        userA: FLOW_PARTNER_SELECTION,
        userB: FLOW_PARTNER_SELECTION,
      },
    });
    if (!match) {
      throw new NotFoundException(INVALID_MESSAGE);
    }
    if (!isActiveStatus(match.status)) {
      throw new GoneException(CLOSED_MESSAGE);
    }

    const [viewer, other] =
      match.userAId === link.userId
        ? [match.userA, match.userB]
        : [match.userB, match.userA];
    if (!other.profile) {
      throw new NotFoundException(INVALID_MESSAGE);
    }

    return {
      step: link.step,
      partner: toFlowPartner(
        other.profile,
        await this.photoUrls.orderedUrls(other.profile.photos),
      ),
      sharedHobbies: sharedHobbyNames(viewer, other),
      otherHobbies: otherHobbyNames(viewer, other),
    };
  }
}
