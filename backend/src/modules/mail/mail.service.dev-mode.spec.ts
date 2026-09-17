import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { setupMailService } from './test-helpers';

jest.mock('resend', () => ({ Resend: jest.fn() }));

describe('MailService without Resend configured', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('never constructs a Resend client', () => {
    setupMailService();

    expect(Resend).not.toHaveBeenCalled();
  });

  it('logs the verification code instead of sending it', async () => {
    const { service, send } = setupMailService();

    await service.sendVerificationCode('ana@eafit.edu.co', '123456', 10);

    expect(send).not.toHaveBeenCalled();
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      expect.stringContaining('123456'),
    );
  });

  it('logs a generic send instead of delivering it', async () => {
    const { service, send } = setupMailService();

    await service.send('ana@eafit.edu.co', {
      subject: 'Hola',
      html: '<p>Hola</p>',
    });

    expect(send).not.toHaveBeenCalled();
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      expect.stringContaining('Hola'),
    );
  });
});
