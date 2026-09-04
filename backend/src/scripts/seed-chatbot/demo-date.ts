import { PrismaClient } from '../../generated/prisma/client';
import { DEMO_DATE_IN_DAYS, DEMO_MATCH_ID, DEMO_VENUE_ID } from './constants';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function seedDemoDate(
  prisma: PrismaClient,
  meId: string,
  partnerId: string,
): Promise<void> {
  const venue = await prisma.venue.upsert({
    where: { id: DEMO_VENUE_ID },
    update: {},
    create: {
      id: DEMO_VENUE_ID,
      name: 'Café Velvet',
      type: 'Café',
      address: 'Cra. 33 #7-26, El Poblado, Medellín',
      openingHours: '8:00-22:00',
      description: 'Café tranquilo, ideal para una primera cita.',
      commissionRate: 0.1,
      averageSpentPerPerson: 35000,
      active: true,
    },
  });

  await prisma.match.upsert({
    where: { id: DEMO_MATCH_ID },
    update: { status: 'confirmed' },
    create: {
      id: DEMO_MATCH_ID,
      userAId: meId,
      userBId: partnerId,
      compatibilityScore: 0.92,
      status: 'confirmed',
    },
  });

  const scheduledAt = new Date(Date.now() + DEMO_DATE_IN_DAYS * DAY_IN_MS);
  await prisma.date.upsert({
    where: { matchId: DEMO_MATCH_ID },
    update: { status: 'confirmed', scheduledAt, venueId: venue.id },
    create: {
      matchId: DEMO_MATCH_ID,
      venueId: venue.id,
      scheduledAt,
      status: 'confirmed',
    },
  });
}
