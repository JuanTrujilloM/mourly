import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PUBLIC_LINK_THROTTLE } from '../../common/constants/throttle';
import { DateViewService } from './date-view.service';

// Public like the scheduling flow: the token in the SMS is the credential.
@Controller('dates')
@Throttle(PUBLIC_LINK_THROTTLE)
export class DateViewController {
  constructor(private readonly dateView: DateViewService) {}

  @Get(':token')
  getDate(@Param('token') token: string) {
    return this.dateView.getView(token);
  }
}
