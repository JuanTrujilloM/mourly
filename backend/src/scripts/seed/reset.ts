import { PrismaClient } from '../../generated/prisma/client';

export async function reset(prisma: PrismaClient): Promise<void> {
  await prisma.feedback.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.venueOption.deleteMany();
  await prisma.date.deleteMany();
  await prisma.report.deleteMany();
  await prisma.profileHobby.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.preferences.deleteMany();
  await prisma.match.deleteMany();
  await prisma.emailVerificationCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.hobby.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();
}
