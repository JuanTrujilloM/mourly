import { PrismaClient } from '../../generated/prisma/client';
import { DEMO_VENUES } from './venues';

export async function seedDemoVenues(prisma: PrismaClient): Promise<number> {
  for (const venue of DEMO_VENUES) {
    const { id, ...fields } = venue;
    await prisma.venue.upsert({
      where: { id },
      update: { ...fields, active: true },
      create: { id, ...fields, active: true },
    });
  }
  return DEMO_VENUES.length;
}
