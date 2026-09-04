import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';
import { MIN_VENUE_SELECTION } from '../matches.constants';

export class SelectVenuesDto {
  @IsArray()
  @ArrayMinSize(MIN_VENUE_SELECTION, {
    message: `Choose exactly ${MIN_VENUE_SELECTION} places.`,
  })
  @ArrayMaxSize(MIN_VENUE_SELECTION, {
    message: `Choose exactly ${MIN_VENUE_SELECTION} places.`,
  })
  @IsString({ each: true })
  venueIds!: string[];
}
