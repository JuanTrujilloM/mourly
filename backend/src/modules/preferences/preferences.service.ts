import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { DEFAULT_HOBBY_CATEGORY } from './constants/preferences-options';
import { CreatePreferencesDto } from './dto/create-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const preferences = await this.prisma.preferences.findUnique({
      where: { userId },
    });
    if (!preferences) return null;

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { hobbies: { include: { hobby: true } } },
    });

    return {
      ...preferences,
      hobbies: profile?.hobbies.map((entry) => entry.hobby.name) ?? [],
    };
  }

  async save(userId: string, dto: CreatePreferencesDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new BadRequestException('Complete your profile before continuing.');
    }
    if (dto.ageRange.min >= dto.ageRange.max) {
      throw new BadRequestException('Invalid age range.');
    }

    const data = {
      relationshipType: dto.relationshipType,
      minAge: dto.ageRange.min,
      maxAge: dto.ageRange.max,
      genderInterests: [...new Set(dto.genderInterests)],
      sameUniversity: dto.sameUniversity,
      heightRange: dto.heightRange,
      energyVibe: dto.energyVibe.join(', '),
    };

    const hobbyNames = [
      ...new Set(dto.hobbies.map((name) => name.trim())),
    ].filter(Boolean);

    return this.prisma.$transaction(async (tx) => {
      await tx.preferences.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      });

      await tx.profileHobby.deleteMany({ where: { profileId: profile.id } });
      for (const name of hobbyNames) {
        const hobby = await tx.hobby.upsert({
          where: { name },
          create: { name, category: DEFAULT_HOBBY_CATEGORY },
          update: {},
        });
        await tx.profileHobby.create({
          data: { profileId: profile.id, hobbyId: hobby.id },
        });
      }

      return tx.preferences.findUniqueOrThrow({ where: { userId } });
    });
  }
}
