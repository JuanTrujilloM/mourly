import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AUTH_THROTTLE } from '../../common/constants/throttle';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PhoneCodeDto } from './dto/phone-code.dto';
import { UpdateCellphoneDto } from './dto/update-cellphone.dto';
import { PhoneVerificationService } from './phone-verification.service';
import type { AuthenticatedUser } from './strategies/jwt.strategy';

@Controller('auth/phone')
@UseGuards(JwtAuthGuard)
@Throttle(AUTH_THROTTLE)
export class PhoneVerificationController {
  constructor(private readonly phones: PhoneVerificationService) {}

  @Patch()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCellphoneDto,
  ) {
    return this.phones.updateCellphone(user.userId, dto.cellphone);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  send(@CurrentUser() user: AuthenticatedUser) {
    return this.phones.sendCode(user.userId);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PhoneCodeDto,
  ) {
    return { user: await this.phones.verify(user.userId, dto.code) };
  }
}
