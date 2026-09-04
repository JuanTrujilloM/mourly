import type { AdminMatchPartner } from './matches';

export interface AdminFeedback {
  id: string;
  occurred: boolean;
  rating: number | null;
  comments: string | null;
  noShowReason: string | null;
  amountSpent: number | null;
  createdAt: string;
  userName: string;
  venueName: string;
  scheduledAt: string;
}

export interface AdminReport {
  id: string;
  createdAt: string;
  reporter: AdminMatchPartner;
  reported: AdminMatchPartner;
}
