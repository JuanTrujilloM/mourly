import { IsNumberString, Length } from 'class-validator';

export class PhoneCodeDto {
  @IsNumberString({}, { message: 'The verification code must be numeric.' })
  @Length(6, 6, { message: 'The verification code must be 6 digits.' })
  code!: string;
}
