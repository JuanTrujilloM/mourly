import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { SessionCookiesService } from './session-cookies.service';

function setup(nodeEnv?: string) {
  const config = {
    get: (key: string) => (key === 'NODE_ENV' ? nodeEnv : undefined),
  } as unknown as ConfigService;
  const cookie = jest.fn();
  const clearCookie = jest.fn();
  const response = { cookie, clearCookie } as unknown as Response;
  return {
    service: new SessionCookiesService(config),
    response,
    cookie,
    clearCookie,
  };
}

describe('SessionCookiesService', () => {
  it('reads the refresh token from the request cookies', () => {
    const { service } = setup();
    const request = { cookies: { refresh_token: 'abc' } } as unknown as Request;

    expect(service.readRefreshToken(request)).toBe('abc');
  });

  it('returns undefined when no cookies are present', () => {
    const { service } = setup();

    expect(service.readRefreshToken({} as unknown as Request)).toBeUndefined();
  });

  it('scopes the refresh cookie to the auth path', () => {
    const { service, response, cookie } = setup();

    service.set(response, 'access', 'refresh');

    expect(cookie.mock.calls[0][0]).toBe('access_token');
    expect(cookie.mock.calls[0][2]).toMatchObject({
      path: '/',
      httpOnly: true,
    });
    expect(cookie.mock.calls[1][0]).toBe('refresh_token');
    expect(cookie.mock.calls[1][2]).toMatchObject({ path: '/auth' });
  });

  it('keeps cookies lax and insecure outside production', () => {
    const { service, response, cookie } = setup('development');

    service.set(response, 'access', 'refresh');

    expect(cookie.mock.calls[0][2]).toMatchObject({
      secure: false,
      sameSite: 'lax',
    });
  });

  it('makes cookies secure and cross-site in production', () => {
    const { service, response, cookie } = setup('production');

    service.set(response, 'access', 'refresh');

    expect(cookie.mock.calls[0][2]).toMatchObject({
      secure: true,
      sameSite: 'none',
    });
  });

  it('clears both cookies with matching paths', () => {
    const { service, response, clearCookie } = setup();

    service.clear(response);

    expect(clearCookie.mock.calls[0][0]).toBe('access_token');
    expect(clearCookie.mock.calls[1][0]).toBe('refresh_token');
    expect(clearCookie.mock.calls[1][1]).toMatchObject({ path: '/auth' });
  });
});
