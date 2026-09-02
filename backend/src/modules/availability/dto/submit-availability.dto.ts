import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsISO8601,
  ValidateNested,
} from 'class-validator';
import { MAX_SLOTS, MIN_SLOTS, TIME_SLOTS } from '../availability.constants';

export class SlotSelectionDto {
  @IsISO8601({ strict: true })
  date!: string;

  @IsIn(TIME_SLOTS)
  timeSlot!: string;
}

export class SubmitAvailabilityDto {
  @IsArray()
  @ArrayMinSize(MIN_SLOTS, { message: 'Selecciona al menos un horario.' })
  @ArrayMaxSize(MAX_SLOTS, { message: 'Seleccionaste demasiados horarios.' })
  @ValidateNested({ each: true })
  @Type(() => SlotSelectionDto)
  slots!: SlotSelectionDto[];
}
