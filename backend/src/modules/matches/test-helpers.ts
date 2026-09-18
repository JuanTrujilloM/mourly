import { PrismaService } from '../../config/prisma.service';
import { CandidateLoaderService } from './candidate-loader.service';
import { MatchHistoryService } from './match-history.service';

export const CANDIDATE_ROW = {
  id: 'u1',
  profile: {
    gender: 'Femenino',
    dateOfBirth: new Date('2003-01-01'),
    university: 'EAFIT',
    major: 'Derecho',
    semester: '6',
    height: 166,
    biography: 'Cine y viajes',
    hobbies: [{ hobby: { name: 'Cine' } }],
  },
  preferences: {
    genderInterests: ['Hombres'],
    minAge: 20,
    maxAge: 28,
    sameUniversity: false,
    relationshipType: 'Seria',
    heightRange: 'Indiferente',
    energyVibe: 'Tranquila',
  },
};

export function setupCandidateLoader(users: unknown[] = [CANDIDATE_ROW]) {
  const findMany = jest.fn().mockResolvedValue(users);
  const prisma = { user: { findMany } } as unknown as PrismaService;
  const history = {
    priorPartnersByUser: jest.fn().mockResolvedValue(new Map()),
    reliabilityByUser: jest.fn().mockResolvedValue(new Map()),
  };
  const service = new CandidateLoaderService(
    prisma,
    history as unknown as MatchHistoryService,
  );
  return { service, findMany, history };
}
