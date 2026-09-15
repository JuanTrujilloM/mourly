import { TimeoutError, withTimeout } from './with-timeout';

describe('withTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with the work result when it finishes in time', async () => {
    await expect(
      withTimeout(Promise.resolve('ok'), 1_000, 'work'),
    ).resolves.toBe('ok');
  });

  it('propagates the work rejection', async () => {
    await expect(
      withTimeout(Promise.reject(new Error('boom')), 1_000, 'work'),
    ).rejects.toThrow('boom');
  });

  it('rejects with a TimeoutError when the work hangs', async () => {
    const pending = withTimeout(new Promise<never>(() => {}), 1_000, 'Resend');
    jest.advanceTimersByTime(1_000);

    await expect(pending).rejects.toBeInstanceOf(TimeoutError);
    await expect(pending).rejects.toThrow('Resend timed out after 1000 ms');
  });

  it('clears the timer once the work settles', async () => {
    await withTimeout(Promise.resolve('ok'), 1_000, 'work');

    expect(jest.getTimerCount()).toBe(0);
  });
});
