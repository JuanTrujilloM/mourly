import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { MAX_CATEGORY_LENGTH, MAX_HOBBY_NAME_LENGTH } from './create-hobby.dto';

function trimmed({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateHobbyDto {
  @IsOptional()
  @IsString()
  @Transform(trimmed)
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  @MaxLength(MAX_HOBBY_NAME_LENGTH)
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(trimmed)
  @IsNotEmpty({ message: 'Category cannot be empty.' })
  @MaxLength(MAX_CATEGORY_LENGTH)
  category?: string;
}
