import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';

export function activeMatchWhere(userId: string) {
  return {
    OR: [{ userAId: userId }, { userBId: userId }],
    status: { in: [...ACTIVE_MATCH_STATUSES] },
  };
}
