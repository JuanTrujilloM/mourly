import { IsOptional, IsString, MaxLength } from 'class-validator';

export const MAX_REASON_LENGTH = 500;

export class CreateReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAX_REASON_LENGTH)
  reason?: string;
}
