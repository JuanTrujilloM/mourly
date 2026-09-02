import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { MatchConfirmationService } from '../matches/match-confirmation.service';
import { VenueSelectionService } from '../matches/venue-selection.service';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';
import { AvailabilityService } from './availability.service';
import { AvailabilityViewService } from './availability-view.service';
import { MatchContextService } from './match-context.service';

export const MATCH_CREATED_AT = new Date('2026-07-09T19:00:00');

export function buildAvailabilityHarness() {
  const createMany = jest.fn().mockResolvedValue({ count: 1 });
  const deleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const findUnique = jest.fn().mockResolvedValue({
    userAId: 'u1',
    userBId: 'u2',
    createdAt: MATCH_CREATED_AT,
    userA: { profile: { name: 'Ana' } },
    userB: { profile: { name: 'Beto' } },
  });

  const prisma = {
    availability: { createMany, deleteMany },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
    match: { findUnique },
  } as unknown as PrismaService;

  const links = {
    validate: jest.fn(),
    setStep: jest.fn().mockResolvedValue(undefined),
    consume: jest.fn().mockResolvedValue(undefined),
  };
  const venues = {
    getSuggestions: jest.fn().mockResolvedValue([]),
    select: jest.fn().mockResolvedValue({ selectedVenueIds: ['v1'] }),
  };
  const confirmation = { tryConfirm: jest.fn().mockResolvedValue('waiting') };

  const resolver = new AvailabilityLinkResolver(
    links as unknown as AvailabilityLinkService,
  );
  const matchContext = new MatchContextService(prisma);

  const service = new AvailabilityService(
    prisma,
    links as unknown as AvailabilityLinkService,
    resolver,
    matchContext,
    venues as unknown as VenueSelectionService,
    confirmation as unknown as MatchConfirmationService,
  );
  const viewService = new AvailabilityViewService(
    resolver,
    matchContext,
    venues as unknown as VenueSelectionService,
  );

  return {
    service,
    viewService,
    links,
    venues,
    confirmation,
    createMany,
    deleteMany,
    findUnique,
  };
}
