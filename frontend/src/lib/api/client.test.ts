import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';

type RejectedHandler = (error: AxiosError) => Promise<unknown>;

interface HandlerEntry {
  rejected?: RejectedHandler;
}

function rejectedHandler(): RejectedHandler {
  const manager = apiClient.interceptors.response as unknown as {
    handlers: HandlerEntry[];
  };
  const handler = manager.handlers.find((entry) => entry.rejected)?.rejected;
  if (!handler) throw new Error('response interceptor not registered');
  return handler;
}

function failureWith(
  status: number,
  url: string,
  extra: Record<string, unknown> = {},
): AxiosError {
  const error = new AxiosError('failed');
  error.config = {
    url,
    headers: new AxiosHeaders(),
    ...extra,
  } as AxiosError['config'];
  error.response = {
    status,
    statusText: '',
    data: {},
    headers: new AxiosHeaders(),
    config: error.config!,
  };
  return error;
}

describe('apiClient response interceptor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends credentials so the auth cookie round-trips', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('refreshes once and replays the original request on a 401', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    const replay = vi
      .spyOn(apiClient, 'request')
      .mockResolvedValue({ data: 'replayed' });
    const original = failureWith(401, '/profile/me');

    await rejectedHandler()(original);

    expect(post).toHaveBeenCalledWith('/auth/refresh');
    expect(replay).toHaveBeenCalled();
  });

  it('marks the request so it is never retried twice', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    vi.spyOn(apiClient, 'request').mockResolvedValue({ data: 'replayed' });
    const original = failureWith(401, '/profile/me');

    await rejectedHandler()(original);

    expect(
      (original.config as unknown as { _retried?: boolean })._retried,
    ).toBe(true);
  });

  it('does not retry a request that already was retried', async () => {
    const post = vi.spyOn(apiClient, 'post');
    const original = failureWith(401, '/profile/me', { _retried: true });

    await expect(rejectedHandler()(original)).rejects.toBe(original);
    expect(post).not.toHaveBeenCalled();
  });

  it('never tries to refresh the refresh call itself', async () => {
    const post = vi.spyOn(apiClient, 'post');
    const original = failureWith(401, '/auth/refresh');

    await expect(rejectedHandler()(original)).rejects.toBe(original);
    expect(post).not.toHaveBeenCalled();
  });

  it('passes through a failure that is not a 401', async () => {
    const post = vi.spyOn(apiClient, 'post');
    const original = failureWith(500, '/profile/me');

    await expect(rejectedHandler()(original)).rejects.toBe(original);
    expect(post).not.toHaveBeenCalled();
  });

  it('gives up when the refresh itself fails', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('expired'));
    const replay = vi.spyOn(apiClient, 'request');
    const original = failureWith(401, '/profile/me');

    await expect(rejectedHandler()(original)).rejects.toBe(original);
    expect(replay).not.toHaveBeenCalled();
  });

  it('shares a single refresh across concurrent failures', async () => {
    const post = vi.spyOn(apiClient, 'post').mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 10)),
    );
    vi.spyOn(apiClient, 'request').mockResolvedValue({ data: 'replayed' });
    const handler = rejectedHandler();

    await Promise.all([
      handler(failureWith(401, '/profile/me')),
      handler(failureWith(401, '/preferences/me')),
    ]);

    expect(post).toHaveBeenCalledTimes(1);
  });
});
