import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { DOMAIN_PATTERN, NormalizeDomain } from './normalize-domain';

export class CreateUniversityDto {
  @IsString()
  @NormalizeDomain()
  @Matches(DOMAIN_PATTERN, { message: 'Domain must look like eafit.edu.co.' })
  domain!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required.' })
  city!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
