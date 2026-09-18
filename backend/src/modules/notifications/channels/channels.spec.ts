import { MailService } from '../../mail/mail.service';
import type { SmsSender } from '../../sms/sms-sender';
import { EmailChannel } from './email.channel';
import { SmsChannel } from './sms.channel';
import type { Notification } from '../notification';

const NOTIFICATION: Notification = {
  kind: 'match_rejected',
  recipient: {
    name: 'Ana',
    email: 'ana@eafit.edu.co',
    cellphone: '3001112233',
  },
};

describe('EmailChannel', () => {
  it('is named email', () => {
    const mail = { send: jest.fn() } as unknown as MailService;

    expect(new EmailChannel(mail).name).toBe('email');
  });

  it('sends the rendered content to the recipient email', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const channel = new EmailChannel({ send } as unknown as MailService);

    await channel.send(NOTIFICATION);

    expect(send.mock.calls[0][0]).toBe('ana@eafit.edu.co');
    expect(send.mock.calls[0][1]).toHaveProperty('subject');
  });
});

describe('SmsChannel', () => {
  function buildChannel() {
    const send = jest.fn().mockResolvedValue(undefined);
    const sender: SmsSender = { send };
    return { channel: new SmsChannel(sender), send };
  }

  it('is named sms', () => {
    expect(buildChannel().channel.name).toBe('sms');
  });

  it('sends to the recipient number in E.164', async () => {
    const { channel, send } = buildChannel();

    await channel.send(NOTIFICATION);

    expect(send.mock.calls[0][0]).toBe('+573001112233');
  });

  it('sends the rendered text', async () => {
    const { channel, send } = buildChannel();

    await channel.send(NOTIFICATION);

    expect(send.mock.calls[0][1]).toContain('Mourly:');
  });

  it('rejects a recipient without a cellphone', async () => {
    const { channel, send } = buildChannel();

    await expect(
      channel.send({
        ...NOTIFICATION,
        recipient: { ...NOTIFICATION.recipient, cellphone: null },
      }),
    ).rejects.toThrow('cellphone');
    expect(send).not.toHaveBeenCalled();
  });
});
