import { IsEmail } from 'class-validator';
import { IsSupportedUniversityEmail } from '../validators/is-supported-university-email.validator';

export class RequestCodeDto {
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsSupportedUniversityEmail()
  email!: string;
}
