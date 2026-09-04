import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { DOMAIN_PATTERN, NormalizeDomain } from './normalize-domain';

export class UpdateUniversityDto {
  @IsOptional()
  @IsString()
  @NormalizeDomain()
  @Matches(DOMAIN_PATTERN, { message: 'Domain must look like eafit.edu.co.' })
  domain?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'City cannot be empty.' })
  city?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
