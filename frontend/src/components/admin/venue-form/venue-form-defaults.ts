import type { VenueValues } from '@/lib/validation/venue';
import type { Venue } from '@/types/venue';

export function venueFormDefaults(venue?: Venue): VenueValues {
  if (!venue) {
    return {
      name: '',
      type: 'Café',
      address: '',
      openingHours: '',
      description: '',
      commissionRate: 0.1,
      averageSpentPerPerson: 0,
      tags: [],
      active: true,
    };
  }

  return {
    name: venue.name,
    type: venue.type,
    address: venue.address,
    openingHours: venue.openingHours,
    description: venue.description,
    commissionRate: venue.commissionRate,
    averageSpentPerPerson: venue.averageSpentPerPerson,
    tags: venue.tags,
    active: venue.active,
  };
}
