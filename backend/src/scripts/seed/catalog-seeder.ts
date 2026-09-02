import { PrismaClient } from '../../generated/prisma/client';
import { HOBBY_CATALOG } from './data/hobbies';
import { VENUES } from './data/venues';

export async function seedHobbies(
  prisma: PrismaClient,
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const [name, category] of Object.entries(HOBBY_CATALOG)) {
    const hobby = await prisma.hobby.create({ data: { name, category } });
    ids.set(name, hobby.id);
  }
  return ids;
}

export async function seedVenues(prisma: PrismaClient): Promise<void> {
  for (const venue of VENUES) {
    await prisma.venue.create({ data: { ...venue, active: true } });
  }
}
