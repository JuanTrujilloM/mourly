import { Twilio } from 'twilio';
import type { SmsOrigin } from './sms-origin';
import { TwilioSmsSender } from './twilio-sms-sender';

jest.mock('twilio', () => ({
  Twilio: jest.fn().mockImplementation(() => ({
    messages: { create: jest.fn().mockResolvedValue({ sid: 'SM1' }) },
  })),
}));

function buildSender(origin: SmsOrigin) {
  const sender = new TwilioSmsSender('ACtest', 'token', origin);
  const create = (Twilio as unknown as jest.Mock).mock.results[0].value.messages
    .create as jest.Mock;
  return { sender, create };
}

describe('TwilioSmsSender', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('builds the client with the account credentials', () => {
    buildSender({ from: '+15005550006' });

    expect(Twilio).toHaveBeenCalledWith('ACtest', 'token');
  });

  it('sends from a phone number', async () => {
    const { sender, create } = buildSender({ from: '+15005550006' });

    await sender.send('+573001112233', 'Hola');

    expect(create).toHaveBeenCalledWith({
      from: '+15005550006',
      to: '+573001112233',
      body: 'Hola',
    });
  });

  it('sends through a messaging service', async () => {
    const { sender, create } = buildSender({ messagingServiceSid: 'MG1' });

    await sender.send('+573001112233', 'Hola');

    expect(create).toHaveBeenCalledWith({
      messagingServiceSid: 'MG1',
      to: '+573001112233',
      body: 'Hola',
    });
  });

  it('propagates a provider failure', async () => {
    const { sender, create } = buildSender({ from: '+15005550006' });
    create.mockRejectedValue(new Error('Invalid To number'));

    await expect(sender.send('+57300', 'Hola')).rejects.toThrow(
      'Invalid To number',
    );
  });

  it('gives up on a provider that never answers', async () => {
    jest.useFakeTimers();
    const { sender, create } = buildSender({ from: '+15005550006' });
    create.mockReturnValue(new Promise(() => undefined));

    const sending = sender.send('+573001112233', 'Hola');
    jest.advanceTimersByTime(10_000);

    await expect(sending).rejects.toThrow('Twilio send timed out');
    jest.useRealTimers();
  });
});
