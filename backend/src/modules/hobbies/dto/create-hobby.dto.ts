import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const MAX_HOBBY_NAME_LENGTH = 60;
export const MAX_CATEGORY_LENGTH = 40;

function trimmed({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateHobbyDto {
  @IsString()
  @Transform(trimmed)
  @IsNotEmpty({ message: 'Name is required.' })
  @MaxLength(MAX_HOBBY_NAME_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @Transform(trimmed)
  @IsNotEmpty({ message: 'Category cannot be empty.' })
  @MaxLength(MAX_CATEGORY_LENGTH)
  category?: string;
}
