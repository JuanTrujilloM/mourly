import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { reset } from './seed/reset';
import { seedHobbies, seedVenues } from './seed/catalog-seeder';
import { seedStudents } from './seed/student-seeder';
import { seedMatches } from './seed/match-seeder';
import { logSummary } from './seed/summary';

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production — this wipes tables.');
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    await reset(prisma);
    const hobbyIds = await seedHobbies(prisma);
    await seedVenues(prisma);
    const profileIds = await seedStudents(prisma, hobbyIds);
    const seedMatchScenarios = process.env.SEED_MATCHES === 'true';
    if (seedMatchScenarios) {
      await seedMatches(prisma, profileIds);
    }
    logSummary(seedMatchScenarios);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) void main();
