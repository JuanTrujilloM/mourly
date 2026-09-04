import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { DEMO_CELLPHONE } from './seed-chatbot/constants';
import { seedDemoUsers } from './seed-chatbot/demo-users';
import { seedDemoDate } from './seed-chatbot/demo-date';

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production.');
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const { meId, partnerId } = await seedDemoUsers(prisma);
    await seedDemoDate(prisma, meId, partnerId);

    console.log(`Seeded demo user. Chat as: ${DEMO_CELLPHONE}`);
    console.log(
      'Try: "hola", "dame consejos para mi cita", "¿quién es mi match?", "¿dónde es mi cita?"',
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) void main();
