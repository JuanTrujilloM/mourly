import { PrismaClient } from '../../generated/prisma/client';
import { STUDENTS } from './data/students';

export async function seedStudents(
  prisma: PrismaClient,
  hobbyIds: Map<string, string>,
): Promise<Map<string, { userId: string; profileId: string }>> {
  const map = new Map<string, { userId: string; profileId: string }>();

  for (const student of STUDENTS) {
    const user = await prisma.user.create({
      data: {
        email: student.email,
        cellphone: student.cellphone,
        isVerified: true,
      },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        name: student.name,
        dateOfBirth: new Date(student.dateOfBirth),
        gender: student.gender,
        height: student.height,
        biography: student.biography,
        university: student.university,
        major: student.major,
        semester: student.semester,
        status: student.status,
      },
    });

    await prisma.photo.createMany({
      data: student.photos.map((url, index) => ({
        profileId: profile.id,
        url,
        isPrimary: index === 0,
      })),
    });

    await prisma.preferences.create({
      data: {
        userId: user.id,
        relationshipType: student.preferences.relationshipType,
        orientation: student.preferences.orientation,
        minAge: student.preferences.minAge,
        maxAge: student.preferences.maxAge,
        genderInterest: student.preferences.genderInterest,
        sameUniversity: student.preferences.sameUniversity,
        heightRange: student.preferences.heightRange,
        energyVibe: student.preferences.energyVibe.join(', '),
      },
    });

    await prisma.profileHobby.createMany({
      data: student.hobbies.map((name) => ({
        profileId: profile.id,
        hobbyId: hobbyIds.get(name)!,
      })),
    });

    map.set(student.key, { userId: user.id, profileId: profile.id });
  }

  return map;
}
