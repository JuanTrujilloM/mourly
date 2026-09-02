import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AUTH_THROTTLE } from '../../common/constants/throttle';
import { AuthService } from './auth.service';
import { RegistrationService } from './registration.service';
import { SessionService } from './session.service';
import { SessionCookiesService } from './session-cookies.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedUser } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registration: RegistrationService,
    private readonly sessions: SessionService,
    private readonly cookies: SessionCookiesService,
  ) {}

  @Post('register')
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  register(@Body() dto: RegisterDto) {
    return this.registration.register(dto);
  }

  @Post('login')
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  async verify(
    @Body() dto: VerifyCodeDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.verify(dto);
    this.cookies.set(response, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.sessions.refresh(
      this.cookies.readRefreshToken(request),
    );
    this.cookies.set(response, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post('resend')
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  resend(@Body() dto: ResendCodeDto) {
    return this.authService.resend(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getById(user.userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.sessions.logout(this.cookies.readRefreshToken(request));
    this.cookies.clear(response);
    return { message: 'Logged out.' };
  }
}
