import { PrismaClient } from '../../generated/prisma/client';
import {
  DEMO_CELLPHONE,
  DEMO_EMAIL,
  DEMO_PARTNER_CELLPHONE,
  DEMO_PARTNER_EMAIL,
} from './constants';

export async function seedDemoUsers(
  prisma: PrismaClient,
): Promise<{ meId: string; partnerId: string }> {
  const me = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { isVerified: true, cellphone: DEMO_CELLPHONE },
    create: {
      email: DEMO_EMAIL,
      cellphone: DEMO_CELLPHONE,
      isVerified: true,
    },
  });
  const partner = await prisma.user.upsert({
    where: { email: DEMO_PARTNER_EMAIL },
    update: { isVerified: true },
    create: {
      email: DEMO_PARTNER_EMAIL,
      cellphone: DEMO_PARTNER_CELLPHONE,
      isVerified: true,
    },
  });

  await prisma.profile.upsert({
    where: { userId: me.id },
    update: {},
    create: {
      userId: me.id,
      name: 'Ana',
      dateOfBirth: new Date('2002-05-10'),
      gender: 'Mujer',
      height: 165,
      biography: 'Amante del café y el cine independiente.',
      university: 'EAFIT',
      major: 'Derecho',
      semester: '6',
    },
  });
  await prisma.profile.upsert({
    where: { userId: partner.id },
    update: {},
    create: {
      userId: partner.id,
      name: 'Sofía',
      dateOfBirth: new Date('2001-03-02'),
      gender: 'Mujer',
      height: 170,
      biography: 'Corro maratones y leo de noche.',
      university: 'CES',
      major: 'Medicina',
      semester: '8',
    },
  });
  await prisma.preferences.upsert({
    where: { userId: me.id },
    update: {},
    create: {
      userId: me.id,
      relationshipType: 'Seria',
      orientation: 'Bisexual',
      minAge: 20,
      maxAge: 28,
      genderInterest: 'Todos',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: 'Tranquila',
    },
  });

  return { meId: me.id, partnerId: partner.id };
}
