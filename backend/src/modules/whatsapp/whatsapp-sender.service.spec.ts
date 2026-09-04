import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappSenderService } from './whatsapp-sender.service';

function setup(token?: string) {
  const config = {
    get: (key: string) => (key === 'WHATSAPP_TOKEN' ? token : undefined),
  } as unknown as ConfigService;
  return new WhatsappSenderService(config);
}

describe('WhatsappSenderService', () => {
  let warn: jest.SpyInstance;
  let log: jest.SpyInstance;

  beforeEach(() => {
    warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs the whole message in dev mode', async () => {
    await setup().send('+573001112233', 'hola');

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('hola'));
  });

  it('stops logging the body once a token is configured', async () => {
    await setup('a-token').send('+573001112233', 'hola');

    expect(warn).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('+573001112233'));
  });
});
