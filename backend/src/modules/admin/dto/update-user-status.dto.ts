import { IsIn } from 'class-validator';
import { AVAILABILITY_STATUSES } from '../../profile/constants/profile-options';

export class UpdateUserStatusDto {
  @IsIn(AVAILABILITY_STATUSES, { message: 'Invalid status.' })
  status!: string;
}
