import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MAX_COMMENT_LENGTH,
  MAX_RATING,
  MIN_RATING,
} from '../feedback.constants';

export class CreateFeedbackDto {
  @IsBoolean()
  occurred!: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_RATING, { message: `Rating must be between 1 and ${MAX_RATING}.` })
  @Max(MAX_RATING, { message: `Rating must be between 1 and ${MAX_RATING}.` })
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_COMMENT_LENGTH)
  comments?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_COMMENT_LENGTH)
  noShowReason?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountSpent?: number;
}
