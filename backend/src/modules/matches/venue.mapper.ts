type VenueSource = {
  id: string;
  name: string;
  type: string;
  address: string;
  openingHours: string;
  description: string;
  tags: string[];
  averageSpentPerPerson: number;
};

export type PublicVenue = VenueSource;

export function toPublicVenue(venue: VenueSource): PublicVenue {
  return {
    id: venue.id,
    name: venue.name,
    type: venue.type,
    address: venue.address,
    openingHours: venue.openingHours,
    description: venue.description,
    tags: venue.tags,
    averageSpentPerPerson: venue.averageSpentPerPerson,
  };
}
