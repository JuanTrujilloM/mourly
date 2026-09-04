import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateVenueDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Type cannot be empty.' })
  type?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Address cannot be empty.' })
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Opening hours cannot be empty.' })
  openingHours?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty.' })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageSpentPerPerson?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
