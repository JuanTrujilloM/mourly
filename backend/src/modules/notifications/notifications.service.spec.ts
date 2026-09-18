import { Logger } from '@nestjs/common';
import type { Notification } from './notification';
import type { NotificationChannel } from './notification-channel';
import { NotificationsService } from './notifications.service';

const REJECTION: Notification = {
  kind: 'match_rejected',
  recipient: {
    name: 'Ana',
    email: 'ana@eafit.edu.co',
    cellphone: '+573001112233',
  },
};

function channel(name: string): NotificationChannel & { send: jest.Mock } {
  return { name, send: jest.fn().mockResolvedValue(undefined) };
}

describe('NotificationsService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fans the notification out to every channel', async () => {
    const email = channel('email');
    const sms = channel('sms');
    const service = new NotificationsService([email, sms]);

    await service.send(REJECTION);

    expect(email.send).toHaveBeenCalledWith(REJECTION);
    expect(sms.send).toHaveBeenCalledWith(REJECTION);
  });

  it('still delivers on the other channels when one fails', async () => {
    const email = channel('email');
    const sms = channel('sms');
    sms.send.mockRejectedValue(new Error('sms down'));
    const service = new NotificationsService([email, sms]);

    await expect(service.send(REJECTION)).resolves.toBeUndefined();
    expect(email.send).toHaveBeenCalled();
  });

  it('names the failing channel and the notification kind in the log', async () => {
    const sms = channel('sms');
    sms.send.mockRejectedValue(new Error('sms down'));
    const service = new NotificationsService([sms]);

    await service.send(REJECTION);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'sms send failed for match_rejected',
      expect.any(String),
    );
  });

  it('logs a non-error rejection reason without crashing', async () => {
    const email = channel('email');
    email.send.mockRejectedValue('plain string');
    const service = new NotificationsService([email]);

    await expect(service.send(REJECTION)).resolves.toBeUndefined();
  });

  it('is a no-op when no channel is registered', async () => {
    const service = new NotificationsService([]);

    await expect(service.send(REJECTION)).resolves.toBeUndefined();
  });
});
