import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { WaitlistService } from './waitlist.service';

@Controller('admin/waitlist')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminWaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Get()
  findAll() {
    return this.waitlist.findAll();
  }
}
