import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CsrfOriginGuard } from './csrf-origin.guard';
import { executionContextWith } from '../test-context';

function buildGuard(env: Record<string, string> = {}) {
  const config = {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
  return new CsrfOriginGuard(config);
}

function request(
  method: string,
  headers: Record<string, string> = {},
): Record<string, unknown> {
  return { method, headers };
}

describe('CsrfOriginGuard', () => {
  it('lets safe methods through without an origin', () => {
    const guard = buildGuard();

    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      expect(guard.canActivate(executionContextWith(request(method)))).toBe(
        true,
      );
    }
  });

  it('accepts a mutating request from the configured frontend', () => {
    const guard = buildGuard({ FRONTEND_URL: 'https://app.mourly.co' });
    const context = executionContextWith(
      request('POST', { origin: 'https://app.mourly.co/' }),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a mutating request from another origin', () => {
    const guard = buildGuard({ FRONTEND_URL: 'https://app.mourly.co' });
    const context = executionContextWith(
      request('POST', { origin: 'https://evil.example' }),
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('falls back to the referer when no origin header is present', () => {
    const guard = buildGuard({ FRONTEND_URL: 'http://localhost:3000' });
    const context = executionContextWith(
      request('POST', { referer: 'http://localhost:3000/dashboard' }),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a malformed referer in production', () => {
    const guard = buildGuard({ NODE_ENV: 'production' });
    const context = executionContextWith(
      request('POST', { referer: 'not-a-url' }),
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows a missing origin outside production so tooling still works', () => {
    const guard = buildGuard();

    expect(guard.canActivate(executionContextWith(request('POST')))).toBe(true);
  });

  it('requires an origin on mutating requests in production', () => {
    const guard = buildGuard({ NODE_ENV: 'production' });

    expect(() =>
      guard.canActivate(executionContextWith(request('POST'))),
    ).toThrow(ForbiddenException);
  });

  it('defaults to localhost when FRONTEND_URL is unset', () => {
    const guard = buildGuard();
    const context = executionContextWith(
      request('DELETE', { origin: 'http://localhost:3000' }),
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
