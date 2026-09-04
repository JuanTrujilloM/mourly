import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PUBLIC_LINK_THROTTLE } from '../../common/constants/throttle';
import { SelectVenuesDto } from '../matches/dto/select-venues.dto';
import { AvailabilityService } from './availability.service';
import { AvailabilityViewService } from './availability-view.service';
import { SubmitAvailabilityDto } from './dto/submit-availability.dto';

@Controller('availability')
@Throttle(PUBLIC_LINK_THROTTLE)
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly viewService: AvailabilityViewService,
  ) {}

  @Get(':token')
  getAvailability(@Param('token') token: string) {
    return this.viewService.getAvailabilityView(token);
  }

  @Post(':token')
  submitAvailability(
    @Param('token') token: string,
    @Body() dto: SubmitAvailabilityDto,
  ) {
    return this.availabilityService.submitAvailability(token, dto.slots);
  }

  @Get(':token/venues')
  getVenues(@Param('token') token: string) {
    return this.viewService.getVenuesView(token);
  }

  @Post(':token/venues')
  selectVenues(@Param('token') token: string, @Body() dto: SelectVenuesDto) {
    return this.availabilityService.selectVenues(token, dto.venueIds);
  }
}
