import { MailService } from '../../mail/mail.service';
import { WhatsappSenderService } from '../../whatsapp/whatsapp-sender.service';
import { EmailChannel } from './email.channel';
import { WhatsappChannel } from './whatsapp.channel';
import type { Notification } from '../notification';

const NOTIFICATION: Notification = {
  kind: 'match_rejected',
  recipient: {
    name: 'Ana',
    email: 'ana@eafit.edu.co',
    cellphone: '+573001112233',
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

describe('WhatsappChannel', () => {
  it('is named whatsapp', () => {
    const sender = { send: jest.fn() } as unknown as WhatsappSenderService;

    expect(new WhatsappChannel(sender).name).toBe('whatsapp');
  });

  it('sends the rendered text to the recipient cellphone', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const channel = new WhatsappChannel({
      send,
    } as unknown as WhatsappSenderService);

    await channel.send(NOTIFICATION);

    expect(send.mock.calls[0][0]).toBe('+573001112233');
    expect(typeof send.mock.calls[0][1]).toBe('string');
  });
});
