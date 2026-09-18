import { Logger } from '@nestjs/common';
import { VerificationDeliveryService } from './verification-delivery.service';
import { VerificationDispatcherService } from './verification-dispatcher.service';

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function setup() {
  const delivery = { sendIfAllowed: jest.fn() };
  const service = new VerificationDispatcherService(
    delivery as unknown as VerificationDeliveryService,
  );
  return { service, delivery };
}

describe('VerificationDispatcherService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns before the delivery finishes', () => {
    const { service, delivery } = setup();
    delivery.sendIfAllowed.mockReturnValue(deferred().promise);

    expect(service.dispatch('u1', 'ana@eafit.edu.co')).toBeUndefined();
    expect(delivery.sendIfAllowed).toHaveBeenCalledWith(
      'u1',
      'ana@eafit.edu.co',
    );
  });

  it('waits for in-flight deliveries when draining', async () => {
    const { service, delivery } = setup();
    const inFlight = deferred();
    delivery.sendIfAllowed.mockReturnValue(inFlight.promise);
    let drained = false;

    service.dispatch('u1', 'ana@eafit.edu.co');
    const draining = service.drain().then(() => (drained = true));
    await Promise.resolve();
    expect(drained).toBe(false);

    inFlight.resolve();
    await draining;
    expect(drained).toBe(true);
  });

  it('logs a failed delivery without the code and keeps draining', async () => {
    const { service, delivery } = setup();
    delivery.sendIfAllowed.mockRejectedValue(new Error('Resend send failed'));

    service.dispatch('u1', 'ana@eafit.edu.co');
    await service.drain();

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Verification delivery failed for user u1',
      expect.stringContaining('Resend send failed'),
    );
  });

  it('stops waiting on shutdown when a delivery hangs', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const { service, delivery } = setup();
    delivery.sendIfAllowed.mockReturnValue(deferred().promise);

    service.dispatch('u1', 'ana@eafit.edu.co');
    const shuttingDown = service.onApplicationShutdown();
    await jest.advanceTimersByTimeAsync(15_000);
    await shuttingDown;

    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      'Shutting down with 1 verification deliveries still pending',
    );
  });

  it('rethrows unexpected shutdown failures', async () => {
    const { service } = setup();
    jest.spyOn(service, 'drain').mockRejectedValue(new Error('boom'));

    await expect(service.onApplicationShutdown()).rejects.toThrow('boom');
  });

  it('logs non-error rejections as text', async () => {
    const { service, delivery } = setup();
    delivery.sendIfAllowed.mockRejectedValue('timeout');

    service.dispatch('u1', 'ana@eafit.edu.co');
    await service.onApplicationShutdown();

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Verification delivery failed for user u1',
      'timeout',
    );
  });
});
