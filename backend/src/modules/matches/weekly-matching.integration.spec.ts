import { PrismaService } from '../../config/prisma.service';
import { VenuesService } from '../venues/venues.service';
import { MatchInviteService } from './match-invite.service';
import { WeeklyMatchingService } from './weekly-matching.service';
import { CandidateLoaderService } from './candidate-loader.service';
import { MatchHistoryService } from './match-history.service';
import { VenueRankingService } from './venue-ranking.service';
import { VenueSelectionService } from './venue-selection.service';

interface StoredMatch {
  id: string;
  userAId: string;
  userBId: string;
  compatibilityScore: number;
  status: string;
}
interface StoredVenue {
  id: string;
  name: string;
  active: boolean;
  averageSpentPerPerson: number;
  tags: string[];
  [key: string]: unknown;
}
interface StoredOption {
  matchId: string;
  venueId: string;
  userAId?: string;
  userBId?: string;
  userASelected: boolean;
  userBSelected: boolean;
}

function buildUser(id: string, gender: string, interest: string) {
  return {
    id,
    isVerified: true,
    profile: {
      gender,
      dateOfBirth: new Date('2003-01-01'),
      university: 'EAFIT',
      major: 'Ingeniería',
      semester: '6',
      height: 175,
      biography: 'Me gusta viajar y la musica',
      hobbies: [{ hobby: { name: 'Cine' } }],
    },
    preferences: {
      genderInterest: interest,
      minAge: 18,
      maxAge: 30,
      sameUniversity: false,
      relationshipType: 'Seria',
      heightRange: 'Indiferente',
      energyVibe: 'Tranquila',
    },
  };
}

function makeStore() {
  const users = [
    buildUser('m', 'Masculino', 'Mujeres'),
    buildUser('w', 'Femenino', 'Hombres'),
  ];
  const matches: StoredMatch[] = [];
  const venueOptions: StoredOption[] = [];
  const venues: StoredVenue[] = [1, 2, 3].map((n) => ({
    id: `v${n}`,
    name: `Café ${n}`,
    type: 'Café',
    address: `Calle ${n}`,
    openingHours: '9-18',
    description: 'Nice',
    tags: [],
    averageSpentPerPerson: 10 * n,
    active: true,
  }));

  const prisma = {
    user: { findMany: () => Promise.resolve(users) },
    feedback: { findMany: () => Promise.resolve([]) },
    profile: {
      findUnique: ({ where }: { where: { userId: string } }) => {
        const user = users.find((u) => u.id === where.userId);
        return Promise.resolve(user ? { hobbies: user.profile.hobbies } : null);
      },
    },
    venue: {
      findMany: ({ where }: { where?: { active?: boolean } }) =>
        Promise.resolve(
          venues.filter((v) => (where?.active ? v.active : true)),
        ),
    },
    match: {
      findMany: ({
        where,
      }: {
        where?: { OR?: unknown; status?: { in?: string[] } };
      }) => {
        if (where?.OR) return Promise.resolve(matches);
        const statuses = where?.status?.in;
        return Promise.resolve(
          matches.filter((m) => !statuses || statuses.includes(m.status)),
        );
      },
      findFirst: ({
        where,
      }: {
        where: { OR: { userAId?: string }[]; status?: { in?: string[] } };
      }) => {
        const uid = where.OR[0].userAId;
        const statuses = where.status?.in;
        return Promise.resolve(
          matches.find(
            (m) =>
              (m.userAId === uid || m.userBId === uid) &&
              (!statuses || statuses.includes(m.status)),
          ) ?? null,
        );
      },
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(matches.find((m) => m.id === where.id) ?? null),
      createMany: ({ data }: { data: Omit<StoredMatch, 'id'>[] }) => {
        for (const row of data) {
          matches.push({ id: `match-${matches.length}`, ...row });
        }
        return Promise.resolve({ count: data.length });
      },
    },
    venueOption: {
      findMany: ({ where }: { where: { matchId: string } }) =>
        Promise.resolve(
          venueOptions
            .filter((o) => o.matchId === where.matchId)
            .map((o) => ({
              ...o,
              venue: venues.find((v) => v.id === o.venueId),
            })),
        ),
      count: () => Promise.resolve(0),
      createMany: ({
        data,
      }: {
        data: { matchId: string; venueId: string }[];
      }) => {
        for (const row of data) {
          venueOptions.push({
            userASelected: false,
            userBSelected: false,
            ...row,
          });
        }
        return Promise.resolve({ count: data.length });
      },
    },
  } as unknown as PrismaService;

  return { prisma, matches };
}

describe('weekly matching → venue selection integration', () => {
  it('generates a match that then drives venue suggestions', async () => {
    const { prisma, matches } = makeStore();
    const invites = {
      inviteForPairs: () => Promise.resolve(),
    } as unknown as MatchInviteService;
    const loader = new CandidateLoaderService(
      prisma,
      new MatchHistoryService(prisma),
    );
    const weekly = new WeeklyMatchingService(prisma, loader, invites);
    const venueSelection = new VenueSelectionService(
      prisma,
      new VenueRankingService(prisma, new VenuesService(prisma)),
    );

    const created = await weekly.runWeeklyMatching();
    expect(created).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      userAId: 'm',
      userBId: 'w',
      status: 'pending',
    });

    const suggestions = await venueSelection.getSuggestions(matches[0].id, 'm');
    expect(suggestions).toHaveLength(3);
    expect(suggestions.every((s) => 'id' in s)).toBe(true);
  });
});
