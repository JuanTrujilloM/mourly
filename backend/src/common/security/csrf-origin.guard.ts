import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

@Injectable()
export class CsrfOriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    const origin = this.originOf(request);
    if (!origin) {
      if (this.isProduction()) {
        throw new ForbiddenException('Missing request origin.');
      }
      return true;
    }
    if (origin !== this.allowedOrigin()) {
      throw new ForbiddenException('Request origin is not allowed.');
    }
    return true;
  }

  private originOf(request: Request): string | null {
    const origin = request.headers.origin;
    if (typeof origin === 'string' && origin.length > 0) {
      return this.normalize(origin);
    }
    const referer = request.headers.referer;
    if (typeof referer === 'string' && referer.length > 0) {
      try {
        return this.normalize(new URL(referer).origin);
      } catch {
        return null;
      }
    }
    return null;
  }

  private allowedOrigin(): string {
    return this.normalize(
      this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL,
    );
  }

  private normalize(value: string): string {
    return value.trim().replace(/\/+$/, '').toLowerCase();
  }

  private isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }
}
