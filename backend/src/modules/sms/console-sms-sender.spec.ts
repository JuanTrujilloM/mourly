import { Logger } from '@nestjs/common';
import { ConsoleSmsSender } from './console-sms-sender';

describe('ConsoleSmsSender', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs the number and the body instead of sending', async () => {
    await new ConsoleSmsSender().send('+573001112233', 'Mourly: hola');

    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      expect.stringContaining('+573001112233'),
    );
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      expect.stringContaining('Mourly: hola'),
    );
  });
});
