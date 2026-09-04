import { nameOf, recipientOf } from '../matches/match-recipients';
import type { Notification } from '../notifications/notification';

type Participant = {
  id: string;
  email: string;
  cellphone: string;
  profile: { name: string } | null;
};

export interface PendingDate {
  venue: { name: string };
  feedbacks: { userId: string }[];
  match: { userA: Participant; userB: Participant };
}

export function notificationsForPendingDate(
  date: PendingDate,
  kind: 'feedback_request' | 'feedback_reminder',
): Notification[] {
  const answered = new Set(date.feedbacks.map((entry) => entry.userId));

  return [
    [date.match.userA, date.match.userB],
    [date.match.userB, date.match.userA],
  ]
    .filter(([user]) => !answered.has(user.id))
    .map(([user, partner]) => ({
      kind,
      recipient: recipientOf(user),
      partnerName: nameOf(partner),
      venueName: date.venue.name,
    }));
}
