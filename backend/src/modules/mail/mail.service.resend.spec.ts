import { Resend } from 'resend';
import { CONTACT_EMAIL, DEFAULT_MAIL_FROM } from './mail.constants';
import { setupMailService } from './test-helpers';

jest.mock('resend', () => ({ Resend: jest.fn() }));

const ENV = {
  RESEND_API_KEY: 're_test_key',
  MAIL_FROM: 'Mourly <no-reply@test>',
};
const MESSAGE = { subject: 'Hola', html: '<p>Hola</p>', text: 'Hola' };

describe('MailService with Resend configured', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds the client with the configured API key', () => {
    setupMailService(ENV);

    expect(Resend).toHaveBeenCalledWith('re_test_key');
  });

  it('sends the verification code in the subject, html and text', async () => {
    const { service, send } = setupMailService(ENV);

    await service.sendVerificationCode('ana@eafit.edu.co', '123456', 10);

    const sent = send.mock.calls[0][0] as Record<string, string>;
    expect(sent.to).toBe('ana@eafit.edu.co');
    expect(sent.subject).toContain('123456');
    expect(sent.html).toContain('123456');
    expect(sent.text).toContain('123456');
  });

  it('sends a generic email with sender, reply-to and both parts', async () => {
    const { service, send } = setupMailService(ENV);

    await service.send('ana@eafit.edu.co', MESSAGE);

    expect(send).toHaveBeenCalledWith({
      from: 'Mourly <no-reply@test>',
      to: 'ana@eafit.edu.co',
      replyTo: CONTACT_EMAIL,
      ...MESSAGE,
    });
  });

  it('falls back to the default sender', async () => {
    const { service, send } = setupMailService({ RESEND_API_KEY: 're_x' });

    await service.send('ana@eafit.edu.co', MESSAGE);

    expect(send.mock.calls[0][0]).toMatchObject({ from: DEFAULT_MAIL_FROM });
  });

  it('honors MAIL_REPLY_TO', async () => {
    const { service, send } = setupMailService({
      ...ENV,
      MAIL_REPLY_TO: 'hola@test',
    });

    await service.send('ana@eafit.edu.co', MESSAGE);

    expect(send.mock.calls[0][0]).toMatchObject({ replyTo: 'hola@test' });
  });

  it('throws when Resend reports an error', async () => {
    const { service, send } = setupMailService(ENV);
    send.mockResolvedValue({
      data: null,
      error: { message: 'invalid domain' },
    });

    await expect(service.send('ana@eafit.edu.co', MESSAGE)).rejects.toThrow(
      'invalid domain',
    );
  });

  it('gives up when Resend never answers', async () => {
    const { service, send } = setupMailService(ENV);
    send.mockReturnValue(new Promise(() => {}));

    const sending = service.send('ana@eafit.edu.co', MESSAGE);
    jest.advanceTimersByTime(10_000);

    await expect(sending).rejects.toThrow('Resend send timed out');
  });
});
