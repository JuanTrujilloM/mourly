import type { MatchPartner } from './match';

export interface DateView {
  viewer: { name: string | null; university: string | null };
  partner: MatchPartner;
  venue: { name: string; address: string };
  scheduledAt: string;
  sharedHobbies: string[];
}
