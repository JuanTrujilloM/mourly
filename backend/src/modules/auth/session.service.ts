import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { SafeUserService, type SafeUser } from './safe-user.service';
import { ACCESS_TOKEN_TTL } from './constants/cookie';

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
};

const EXPIRED_SESSION_MESSAGE = 'Session expired. Please log in again.';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly safeUsers: SafeUserService,
    private readonly jwt: JwtService,
  ) {}

  async issueFor(userId: string, email: string): Promise<Session> {
    return {
      accessToken: await this.signAccessToken(userId, email),
      refreshToken: await this.refreshTokens.issueForUser(userId),
      user: await this.safeUsers.getById(userId),
    };
  }

  async refresh(refreshToken: string | undefined): Promise<Session> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    const result = await this.refreshTokens.rotate(refreshToken);
    if (result.status === 'reuse_detected') {
      await this.refreshTokens.revokeAllForUser(result.userId);
      throw new UnauthorizedException(EXPIRED_SESSION_MESSAGE);
    }
    if (result.status !== 'ok') {
      throw new UnauthorizedException(EXPIRED_SESSION_MESSAGE);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: result.userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      accessToken: await this.signAccessToken(user.id, user.email),
      refreshToken: result.token,
      user: await this.safeUsers.getById(user.id),
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await this.refreshTokens.revoke(refreshToken);
    }
  }

  private signAccessToken(userId: string, email: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: ACCESS_TOKEN_TTL },
    );
  }
}
