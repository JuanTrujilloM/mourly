import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { SEED_MATCH_ID } from './seed-places/constants';
import { upsertPartner } from './seed-places/partner';
import { seedDemoVenues } from './seed-places/venue-seeder';

async function seedPendingMatch(
  prisma: PrismaClient,
  targetEmail: string,
): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!user) {
    console.log(
      `No registered user for ${targetEmail}. Register + finish onboarding first, then re-run.`,
    );
    return false;
  }

  const partnerId = await upsertPartner(prisma);
  await prisma.match.upsert({
    where: { id: SEED_MATCH_ID },
    update: { status: 'pending', userAId: user.id, userBId: partnerId },
    create: {
      id: SEED_MATCH_ID,
      userAId: user.id,
      userBId: partnerId,
      compatibilityScore: 0.88,
      status: 'pending',
    },
  });
  await prisma.venueOption.deleteMany({ where: { matchId: SEED_MATCH_ID } });
  return true;
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production.');
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const count = await seedDemoVenues(prisma);
    console.log(`Seeded ${count} venues near EAFIT.`);

    const targetEmail = process.argv[2]?.trim().toLowerCase();
    if (!targetEmail) {
      console.log(
        'No email passed — skipped match seeding. To test the dashboard ' +
          'redirect: node dist/src/scripts/seed-places.js you@eafit.edu.co',
      );
      return;
    }

    if (await seedPendingMatch(prisma, targetEmail)) {
      console.log(
        `Seeded a pending match for ${targetEmail}. Log in and open /dashboard ` +
          'to be redirected to place selection.',
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) void main();
