import { IsIn } from 'class-validator';
import { AVAILABILITY_STATUSES } from '../constants/profile-options';

export class UpdateAvailabilityDto {
  @IsIn(AVAILABILITY_STATUSES, { message: 'Invalid availability status.' })
  status!: string;
}
