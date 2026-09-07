import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  RELATIONSHIP_TYPES,
  GENDER_INTERESTS,
  HEIGHT_RANGES,
  AGE_MIN,
  AGE_MAX,
  MIN_HOBBIES,
  MIN_VIBES,
  MIN_GENDER_INTERESTS,
} from '../constants/preferences-options';

class AgeRangeDto {
  @IsInt()
  @Min(AGE_MIN)
  @Max(AGE_MAX)
  min!: number;

  @IsInt()
  @Min(AGE_MIN)
  @Max(AGE_MAX)
  max!: number;
}

export class CreatePreferencesDto {
  @ValidateNested()
  @Type(() => AgeRangeDto)
  ageRange!: AgeRangeDto;

  @IsArray()
  @ArrayMinSize(MIN_HOBBIES, {
    message: `Select at least ${MIN_HOBBIES} hobbies.`,
  })
  @IsString({ each: true })
  hobbies!: string[];

  @IsIn(RELATIONSHIP_TYPES, { message: 'Invalid relationship type.' })
  relationshipType!: string;

  @IsArray()
  @ArrayMinSize(MIN_GENDER_INTERESTS, {
    message: 'Select at least one gender.',
  })
  @ArrayMaxSize(GENDER_INTERESTS.length, { message: 'Too many genders.' })
  @IsIn(GENDER_INTERESTS, { each: true, message: 'Invalid gender interest.' })
  genderInterests!: string[];

  @IsBoolean()
  sameUniversity!: boolean;

  @IsIn(HEIGHT_RANGES, { message: 'Invalid height range.' })
  heightRange!: string;

  @IsArray()
  @ArrayMinSize(MIN_VIBES, { message: 'Select at least one vibe.' })
  @IsString({ each: true })
  energyVibe!: string[];
}
