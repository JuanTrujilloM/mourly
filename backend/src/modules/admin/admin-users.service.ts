import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ageFrom } from '../../common/utils/age';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    const [users, matches] = await Promise.all([
      this.prisma.user.findMany({
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.match.findMany({ select: { userAId: true, userBId: true } }),
    ]);

    const matchCount = new Map<string, number>();
    for (const match of matches) {
      matchCount.set(match.userAId, (matchCount.get(match.userAId) ?? 0) + 1);
      matchCount.set(match.userBId, (matchCount.get(match.userBId) ?? 0) + 1);
    }

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      cellphone: user.cellphone,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      matchCount: matchCount.get(user.id) ?? 0,
      profile: user.profile
        ? {
            name: user.profile.name,
            age: ageFrom(user.profile.dateOfBirth),
            gender: user.profile.gender,
            university: user.profile.university,
            major: user.profile.major,
            semester: user.profile.semester,
            status: user.profile.status,
          }
        : null,
    }));
  }

  async setUserStatus(userId: string, status: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('This user has no profile yet.');
    }

    await this.prisma.profile.update({ where: { userId }, data: { status } });
    return { id: userId, status };
  }

  async verifyUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    return { id: userId, isVerified: true };
  }
}
