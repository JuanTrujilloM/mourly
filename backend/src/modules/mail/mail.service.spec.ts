import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailService } from './mail.service';

jest.mock('resend', () => ({
  Resend: jest.fn(),
}));

const ResendMock = Resend as jest.MockedClass<typeof Resend>;

function setup(env: Record<string, string> = {}) {
  const send = jest.fn().mockResolvedValue({ data: { id: 'email_1' }, error: null });
  ResendMock.mockImplementation(
    () => ({ emails: { send } }) as unknown as Resend,
  );

  const config = {
    get: (key: string, fallback?: string) => env[key] ?? fallback,
  } as unknown as ConfigService;

  const service = new MailService(config);
  return { service, send };
}

describe('MailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('without Resend configured', () => {
    it('never constructs a Resend client', () => {
      setup();

      expect(ResendMock).not.toHaveBeenCalled();
    });

    it('logs the verification code instead of sending it', async () => {
      const { service, send } = setup();

      await service.sendVerificationCode('ana@eafit.edu.co', '123456');

      expect(send).not.toHaveBeenCalled();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('123456'),
      );
    });

    it('logs a generic send instead of delivering it', async () => {
      const { service, send } = setup();

      await service.send('ana@eafit.edu.co', {
        subject: 'Hola',
        html: '<p>Hola</p>',
      });

      expect(send).not.toHaveBeenCalled();
    });
  });

  describe('with Resend configured', () => {
    const RESEND_ENV = {
      RESEND_API_KEY: 're_test_key',
      MAIL_FROM: 'Mourly <no-reply@test>',
    };

    it('builds the client with the configured API key', () => {
      setup(RESEND_ENV);

      expect(ResendMock).toHaveBeenCalledWith('re_test_key');
    });

    it('sends the verification code email', async () => {
      const { service, send } = setup(RESEND_ENV);

      await service.sendVerificationCode('ana@eafit.edu.co', '123456');

      expect(send).toHaveBeenCalledTimes(1);
      const sent = send.mock.calls[0][0] as { html: string; to: string };
      expect(sent.to).toBe('ana@eafit.edu.co');
      expect(sent.html).toContain('123456');
    });

    it('sends a generic email with the configured sender', async () => {
      const { service, send } = setup(RESEND_ENV);

      await service.send('ana@eafit.edu.co', {
        subject: 'Hola',
        html: '<p>Hola</p>',
      });

      expect(send).toHaveBeenCalledWith({
        from: 'Mourly <no-reply@test>',
        to: 'ana@eafit.edu.co',
        subject: 'Hola',
        html: '<p>Hola</p>',
      });
    });

    it('throws when Resend reports an error', async () => {
      const { service, send } = setup(RESEND_ENV);
      send.mockResolvedValue({ data: null, error: { message: 'invalid domain' } });

      await expect(
        service.send('ana@eafit.edu.co', { subject: 'Hola', html: '<p>Hola</p>' }),
      ).rejects.toThrow('invalid domain');
    });
  });
});
