import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const createTransport = nodemailer.createTransport as jest.MockedFunction<
  typeof nodemailer.createTransport
>;

function setup(env: Record<string, string> = {}) {
  const sendMail = jest.fn().mockResolvedValue({});
  createTransport.mockReturnValue({
    sendMail,
  } as unknown as nodemailer.Transporter);

  const config = {
    get: (key: string, fallback?: string) => env[key] ?? fallback,
  } as unknown as ConfigService;

  const service = new MailService(config);
  service.onModuleInit();
  return { service, sendMail };
}

describe('MailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('without SMTP configured', () => {
    it('uses a json transport instead of a real connection', () => {
      setup();

      expect(createTransport).toHaveBeenCalledWith({ jsonTransport: true });
    });

    it('logs the verification code instead of sending it', async () => {
      const { service, sendMail } = setup();

      await service.sendVerificationCode('ana@eafit.edu.co', '123456');

      expect(sendMail).not.toHaveBeenCalled();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('123456'),
      );
    });

    it('logs a generic send instead of delivering it', async () => {
      const { service, sendMail } = setup();

      await service.send('ana@eafit.edu.co', {
        subject: 'Hola',
        html: '<p>Hola</p>',
      });

      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe('with SMTP configured', () => {
    const SMTP_ENV = {
      SMTP_HOST: 'smtp.test',
      SMTP_PORT: '2525',
      SMTP_SECURE: 'true',
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
      MAIL_FROM: 'TheConnection <no-reply@test>',
    };

    it('builds the transport from the configuration', () => {
      setup(SMTP_ENV);

      expect(createTransport).toHaveBeenCalledWith({
        host: 'smtp.test',
        port: 2525,
        secure: true,
        auth: { user: 'user', pass: 'pass' },
      });
    });

    it('defaults to port 587 when unset', () => {
      setup({ SMTP_HOST: 'smtp.test' });

      expect(createTransport.mock.calls[0][0]).toMatchObject({ port: 587 });
    });

    it('sends the verification code email', async () => {
      const { service, sendMail } = setup(SMTP_ENV);

      await service.sendVerificationCode('ana@eafit.edu.co', '123456');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const sent = sendMail.mock.calls[0][0] as { html: string; to: string };
      expect(sent.to).toBe('ana@eafit.edu.co');
      expect(sent.html).toContain('123456');
    });

    it('sends a generic email with the configured sender', async () => {
      const { service, sendMail } = setup(SMTP_ENV);

      await service.send('ana@eafit.edu.co', {
        subject: 'Hola',
        html: '<p>Hola</p>',
      });

      expect(sendMail).toHaveBeenCalledWith({
        from: 'TheConnection <no-reply@test>',
        to: 'ana@eafit.edu.co',
        subject: 'Hola',
        html: '<p>Hola</p>',
      });
    });
  });
});
