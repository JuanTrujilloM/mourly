import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';

const MATCH_SELECTION = {
  id: true,
  userAId: true,
  userBId: true,
  status: true,
  scheduleAttempts: true,
  date: { select: { id: true } },
  availabilities: { select: { userId: true, date: true, timeSlot: true } },
  venueOptions: {
    select: {
      venueId: true,
      userASelected: true,
      userBSelected: true,
      venue: { select: { name: true, address: true } },
    },
  },
  userA: {
    select: {
      id: true,
      email: true,
      cellphone: true,
      profile: { select: { name: true } },
    },
  },
  userB: {
    select: {
      id: true,
      email: true,
      cellphone: true,
      profile: { select: { name: true } },
    },
  },
};

@Injectable()
export class MatchLoaderService {
  constructor(private readonly prisma: PrismaService) {}

  loadById(matchId: string) {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      select: MATCH_SELECTION,
    });
  }

  loadOverdue(now: Date) {
    return this.prisma.match.findMany({
      where: {
        status: { in: [...ACTIVE_MATCH_STATUSES] },
        date: { is: null },
        scheduleDeadline: { lt: now },
      },
      select: MATCH_SELECTION,
    });
  }
}

export type LoadedMatch = NonNullable<
  Awaited<ReturnType<MatchLoaderService['loadById']>>
>;
