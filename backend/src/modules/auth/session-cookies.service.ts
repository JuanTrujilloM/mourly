import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_MS,
} from './constants/cookie';

@Injectable()
export class SessionCookiesService {
  constructor(private readonly config: ConfigService) {}

  readRefreshToken(request: Request): string | undefined {
    return request.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  }

  set(response: Response, accessToken: string, refreshToken: string): void {
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.baseOptions(),
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.baseOptions(),
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }

  clear(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE, this.baseOptions());
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...this.baseOptions(),
      path: REFRESH_COOKIE_PATH,
    });
  }

  private baseOptions(): CookieOptions {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };
  }
}
