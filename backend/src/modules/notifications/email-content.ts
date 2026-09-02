import { dateConfirmationEmail } from '../mail/templates/date-confirmation.template';
import { matchInviteEmail } from '../mail/templates/match-invite.template';
import { matchRejectedEmail } from '../mail/templates/match-rejected.template';
import { moreAvailabilityEmail } from '../mail/templates/more-availability.template';
import { reschedulingFailedEmail } from '../mail/templates/rescheduling-failed.template';
import type { Notification } from './notification';

export interface EmailContent {
  subject: string;
  html: string;
}

export function emailContentFor(notification: Notification): EmailContent {
  const recipientName = notification.recipient.name;

  switch (notification.kind) {
    case 'match_invite':
      return matchInviteEmail({
        recipientName,
        partner: notification.partner,
        availabilityUrl: notification.availabilityUrl,
        expiresInDays: notification.expiresInDays,
      });
    case 'date_proposal':
      return dateConfirmationEmail({
        recipientName,
        partnerName: notification.partnerName,
        whenText: notification.whenText,
        venueName: notification.venueName,
        venueAddress: notification.venueAddress,
      });
    case 'more_availability':
      return moreAvailabilityEmail({
        recipientName,
        partnerName: notification.partnerName,
        availabilityUrl: notification.availabilityUrl,
      });
    case 'match_rejected':
      return matchRejectedEmail(recipientName);
    case 'rescheduling_failed':
      return reschedulingFailedEmail(recipientName);
  }
}
