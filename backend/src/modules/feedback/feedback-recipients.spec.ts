import { notificationsForPendingDate } from './feedback-recipients';

function participant(id: string, name: string | null) {
  return {
    id,
    email: `${id}@eafit.edu.co`,
    cellphone: `+57300111223${id.length}`,
    profile: name ? { name } : null,
  };
}

function pendingDate(answeredBy: string[] = []) {
  return {
    venue: { name: 'Pergamino' },
    feedbacks: answeredBy.map((userId) => ({ userId })),
    match: {
      userA: participant('a', 'Ana'),
      userB: participant('b', 'Beto'),
    },
  };
}

describe('notificationsForPendingDate', () => {
  it('asks both participants when nobody answered', () => {
    const result = notificationsForPendingDate(
      pendingDate(),
      'feedback_request',
    );

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.kind)).toEqual([
      'feedback_request',
      'feedback_request',
    ]);
  });

  it('names the partner, not the recipient', () => {
    const [first, second] = notificationsForPendingDate(
      pendingDate(),
      'feedback_request',
    );

    expect(first.recipient.email).toBe('a@eafit.edu.co');
    expect(first).toMatchObject({ partnerName: 'Beto' });
    expect(second).toMatchObject({ partnerName: 'Ana' });
  });

  it('skips whoever already answered', () => {
    const result = notificationsForPendingDate(
      pendingDate(['a']),
      'feedback_reminder',
    );

    expect(result).toHaveLength(1);
    expect(result[0].recipient.email).toBe('b@eafit.edu.co');
  });

  it('produces nothing once both answered', () => {
    expect(
      notificationsForPendingDate(pendingDate(['a', 'b']), 'feedback_reminder'),
    ).toEqual([]);
  });

  it('carries the venue name for the message', () => {
    const [first] = notificationsForPendingDate(
      pendingDate(),
      'feedback_request',
    );

    expect(first).toMatchObject({ venueName: 'Pergamino' });
  });

  it('falls back to a generic partner name without a profile', () => {
    const date = pendingDate();
    date.match.userB = participant('b', null);

    const [first] = notificationsForPendingDate(date, 'feedback_request');

    expect(first).toMatchObject({ partnerName: 'tu match' });
  });
});
