export interface Recipient {
  name: string;
  email: string;
  cellphone: string;
}

export interface PartnerSummary {
  name: string;
  age: number | null;
  university: string | null;
  major: string | null;
  photoUrl: string | null;
}

export type Notification =
  | {
      kind: 'match_invite';
      recipient: Recipient;
      partner: PartnerSummary;
      availabilityUrl: string;
      expiresInDays: number;
    }
  | {
      kind: 'date_proposal';
      recipient: Recipient;
      partnerName: string;
      whenText: string;
      venueName: string;
      venueAddress: string;
    }
  | {
      kind: 'more_availability';
      recipient: Recipient;
      partnerName: string;
      availabilityUrl: string;
    }
  | {
      kind: 'feedback_request';
      recipient: Recipient;
      partnerName: string;
      venueName: string;
    }
  | {
      kind: 'feedback_reminder';
      recipient: Recipient;
      partnerName: string;
      venueName: string;
    }
  | { kind: 'match_rejected'; recipient: Recipient }
  | { kind: 'rescheduling_failed'; recipient: Recipient };

export type NotificationKind = Notification['kind'];
