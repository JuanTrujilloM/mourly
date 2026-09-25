import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ageFrom } from '../../common/utils/age';
import { firstName } from '../../common/utils/first-name';
import { otherHobbyNames, sharedHobbyNames } from '../matches/shared-hobbies';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';

const INVALID_MESSAGE = 'Este enlace no es válido.';

const PROFILE_SELECTION = {
  select: {
    profile: {
      select: {
        name: true,
        dateOfBirth: true,
        university: true,
        major: true,
        semester: true,
        biography: true,
        photos: {
          select: { url: true, isPrimary: true },
          orderBy: { createdAt: 'asc' as const },
        },
        hobbies: { select: { hobby: { select: { name: true } } } },
      },
    },
  },
};

export interface FlowPartner {
  firstName: string;
  age: number;
  university: string;
  major: string;
  semester: string;
  biography: string;
  photos: string[];
}

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
        userA: PROFILE_SELECTION,
        userB: PROFILE_SELECTION,
      },
    });
    const [viewer, other] =
      match?.userAId === link.userId
        ? [match.userA, match.userB]
        : [match?.userB, match?.userA];
    const profile = other?.profile;
    if (!match || !profile) {
      throw new NotFoundException(INVALID_MESSAGE);
    }

    return {
      step: link.step,
      partner: {
        firstName: firstName(profile.name),
        age: ageFrom(profile.dateOfBirth),
        university: profile.university,
        major: profile.major,
        semester: profile.semester,
        biography: profile.biography,
        photos: primaryFirst(profile.photos),
      },
      sharedHobbies: sharedHobbyNames(viewer ?? null, other ?? null),
      otherHobbies: otherHobbyNames(viewer ?? null, other ?? null),
    };
  }
}

function primaryFirst(photos: { url: string; isPrimary: boolean }[]): string[] {
  return [
    ...photos.filter((photo) => photo.isPrimary),
    ...photos.filter((photo) => !photo.isPrimary),
  ].map((photo) => photo.url);
}
