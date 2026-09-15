import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { WaitlistService } from './waitlist.service';
import { ListWaitlistDto } from './dto/list-waitlist.dto';

@Controller('admin/waitlist')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminWaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Get()
  findPage(@Query() query: ListWaitlistDto) {
    return this.waitlist.findPage(query);
  }
}
