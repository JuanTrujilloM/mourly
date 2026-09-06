import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AUTH_THROTTLE } from '../../common/constants/throttle';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Post()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  join(@Body() dto: JoinWaitlistDto) {
    return this.waitlist.join(dto);
  }
}
