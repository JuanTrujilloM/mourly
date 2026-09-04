import { availabilityFor, intersection } from './admin.mappers';
import { mapUserDetail } from './admin-user-detail.mapper';

type FeedbackEntry = {
  userName: string;
  occurred: boolean;
  rating: number | null;
  comments: string | null;
  noShowReason: string | null;
  amountSpent: number | null;
};

type DetailMatch = {
  id: string;
  status: string;
  compatibilityScore: number;
  createdAt: Date;
  updatedAt: Date;
  userAId: string;
  userBId: string;
  userA: Parameters<typeof mapUserDetail>[0];
  userB: Parameters<typeof mapUserDetail>[0];
  date: {
    scheduledAt: Date;
    status: string;
    venue: { name: string; address: string };
  } | null;
  venueOptions: {
    venue: { name: string; type: string };
    userASelected: boolean;
    userBSelected: boolean;
  }[];
  availabilities: { userId: string; date: Date; timeSlot: string }[];
};

export function toMatchDetail(match: DetailMatch, feedback: FeedbackEntry[]) {
  const userA = mapUserDetail(match.userA);
  const userB = mapUserDetail(match.userB);

  return {
    id: match.id,
    status: match.status,
    compatibilityScore: match.compatibilityScore,
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
    userA,
    userB,
    sharedHobbies: intersection(userA.hobbies, userB.hobbies),
    venueOptions: match.venueOptions.map((option) => ({
      venueName: option.venue.name,
      type: option.venue.type,
      userASelected: option.userASelected,
      userBSelected: option.userBSelected,
    })),
    availability: {
      userA: availabilityFor(match.availabilities, match.userAId),
      userB: availabilityFor(match.availabilities, match.userBId),
    },
    date: match.date
      ? {
          venueName: match.date.venue.name,
          address: match.date.venue.address,
          scheduledAt: match.date.scheduledAt,
          status: match.date.status,
        }
      : null,
    feedback,
  };
}
