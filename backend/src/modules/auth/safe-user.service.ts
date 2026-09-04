import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { isAdminEmail } from '../../common/constants/admin';
import { UniversitiesService } from '../universities/universities.service';

export type SafeUser = {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
  university: string;
  onboardingCompleted: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class SafeUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly universities: UniversitiesService,
  ) {}

  async getById(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { select: { id: true } },
        preferences: { select: { id: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      cellphone: user.cellphone,
      isVerified: user.isVerified,
      university: await this.universities.nameForEmail(user.email),
      onboardingCompleted: user.profile !== null && user.preferences !== null,
      isAdmin: isAdminEmail(user.email),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
