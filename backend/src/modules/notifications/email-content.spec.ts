import { emailContentFor } from './email-content';
import { ALL_NOTIFICATIONS, INVITE_URL, notificationOf } from './test-helpers';

describe('emailContentFor', () => {
  it.each(ALL_NOTIFICATIONS)('builds a subject and html for $kind', (item) => {
    const content = emailContentFor(item);

    expect(content.subject.length).toBeGreaterThan(0);
    expect(content.html).toContain('<');
  });

  it('puts the availability link in the invite email', () => {
    expect(emailContentFor(notificationOf('match_invite')).html).toContain(
      INVITE_URL,
    );
  });

  it('puts the venue address in the date proposal email', () => {
    expect(emailContentFor(notificationOf('date_proposal')).html).toContain(
      'Cra 37',
    );
  });
});
