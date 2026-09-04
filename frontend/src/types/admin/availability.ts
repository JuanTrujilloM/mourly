export interface AdminAvailabilitySlot {
  date: string;
  timeSlot: string;
}

export interface AdminVenueOption {
  venueName: string;
  type: string;
  userASelected: boolean;
  userBSelected: boolean;
}

export interface AdminMatchFeedback {
  userName: string;
  occurred: boolean;
  rating: number | null;
  comments: string | null;
  noShowReason: string | null;
  amountSpent: number | null;
}
