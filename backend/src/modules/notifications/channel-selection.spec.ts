import { activeChannels, emailNotificationsEnabled } from './channel-selection';
import type { NotificationChannel } from './notification-channel';

const email = { name: 'email', send: jest.fn() } as NotificationChannel;
const sms = { name: 'sms', send: jest.fn() } as NotificationChannel;

describe('emailNotificationsEnabled', () => {
  it('is on for the literal true', () => {
    expect(emailNotificationsEnabled('true')).toBe(true);
  });

  it.each([undefined, '', 'false', '1'])('is off for %p', (value) => {
    expect(emailNotificationsEnabled(value)).toBe(false);
  });
});

describe('activeChannels', () => {
  it('keeps email first when enabled', () => {
    expect(activeChannels(true, email, [sms])).toEqual([email, sms]);
  });

  it('drops email when disabled', () => {
    expect(activeChannels(false, email, [sms])).toEqual([sms]);
  });
});
