import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { DateLinkService } from './date-link.service';
import type { LoadedMatch } from './match-loader.service';
import { nameOf, recipientOf } from './match-recipients';
import type { CommonSlot } from './match-scheduling';

@Injectable()
export class DateAnnouncerService {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly dateLinks: DateLinkService,
  ) {}

  announce(
    match: LoadedMatch,
    slot: CommonSlot,
    venue: { name: string; address: string },
  ): Promise<unknown> {
    return Promise.all(
      [
        [match.userA, match.userB],
        [match.userB, match.userA],
      ].map(async ([user, partner]) =>
        this.notifications.send({
          kind: 'date_proposal',
          recipient: recipientOf(user),
          partnerName: nameOf(partner),
          whenText: slot.label,
          venueName: venue.name,
          venueAddress: venue.address,
          dateUrl: await this.dateLinks.urlFor(
            match.id,
            user.id,
            slot.scheduledAt,
          ),
        }),
      ),
    );
  }
}
