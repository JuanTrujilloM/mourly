import type { AdminAvailabilitySlot, AdminVenueOption } from './availability';
import type { AdminMatchFeedback } from './availability';
import type { AdminUserDetail } from './user-detail';

export interface AdminMatchDetail {
  id: string;
  status: string;
  compatibilityScore: number;
  createdAt: string;
  updatedAt: string;
  userA: AdminUserDetail;
  userB: AdminUserDetail;
  sharedHobbies: string[];
  venueOptions: AdminVenueOption[];
  availability: {
    userA: AdminAvailabilitySlot[];
    userB: AdminAvailabilitySlot[];
  };
  date: {
    venueName: string;
    address: string;
    scheduledAt: string;
    status: string;
  } | null;
  feedback: AdminMatchFeedback[];
}
