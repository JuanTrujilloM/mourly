export interface AdminMatchPartner {
  id: string;
  name: string;
  university: string;
}

export interface AdminMatchDate {
  scheduledAt: string;
  status: string;
  venueName: string;
}

export interface AdminMatch {
  id: string;
  status: string;
  compatibilityScore: number;
  createdAt: string;
  userA: AdminMatchPartner;
  userB: AdminMatchPartner;
  date: AdminMatchDate | null;
}
