export interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  openingHours: string;
  description: string;
  commissionRate: number;
  averageSpentPerPerson: number;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VenueSuggestion {
  id: string;
  name: string;
  type: string;
  address: string;
  openingHours: string;
  description: string;
  tags: string[];
  averageSpentPerPerson: number;
  selected: boolean;
}

export interface VenuePayload {
  name: string;
  type: string;
  address: string;
  openingHours: string;
  description: string;
  commissionRate: number;
  averageSpentPerPerson: number;
  tags: string[];
  active: boolean;
}
