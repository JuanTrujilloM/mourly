import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Type is required.' })
  type!: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required.' })
  address!: string;

  @IsString()
  @IsNotEmpty({ message: 'Opening hours are required.' })
  openingHours!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  description!: string;

  @IsNumber()
  @Min(0)
  commissionRate!: number;

  @IsNumber()
  @Min(0)
  averageSpentPerPerson!: number;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
