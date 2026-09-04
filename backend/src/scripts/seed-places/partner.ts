import { PrismaClient } from '../../generated/prisma/client';
import { PARTNER_CELLPHONE, PARTNER_EMAIL, PARTNER_HOBBIES } from './constants';

export async function upsertPartner(prisma: PrismaClient): Promise<string> {
  const partner = await prisma.user.upsert({
    where: { email: PARTNER_EMAIL },
    update: { isVerified: true },
    create: {
      email: PARTNER_EMAIL,
      cellphone: PARTNER_CELLPHONE,
      isVerified: true,
    },
  });

  const profile = await prisma.profile.upsert({
    where: { userId: partner.id },
    update: {},
    create: {
      userId: partner.id,
      name: 'Mariana',
      dateOfBirth: new Date('2002-04-18'),
      gender: 'Mujer',
      height: 168,
      biography: 'Amante del café, el cine y los parques al atardecer.',
      university: 'CES',
      major: 'Comunicación',
      semester: '7',
    },
  });

  await linkHobbies(prisma, profile.id);
  return partner.id;
}

async function linkHobbies(
  prisma: PrismaClient,
  profileId: string,
): Promise<void> {
  for (const name of PARTNER_HOBBIES) {
    const hobby = await prisma.hobby.upsert({
      where: { name },
      create: { name, category: 'general' },
      update: {},
    });
    await prisma.profileHobby.upsert({
      where: { profileId_hobbyId: { profileId, hobbyId: hobby.id } },
      create: { profileId, hobbyId: hobby.id },
      update: {},
    });
  }
}
