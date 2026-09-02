import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { DEFAULT_HOBBY_CATEGORY } from '../preferences/constants/preferences-options';
import { CreateHobbyDto } from './dto/create-hobby.dto';
import { UpdateHobbyDto } from './dto/update-hobby.dto';

@Injectable()
export class HobbiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const hobbies = await this.prisma.hobby.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { profiles: true } } },
    });

    return hobbies.map((hobby) => ({
      id: hobby.id,
      name: hobby.name,
      category: hobby.category,
      profileCount: hobby._count.profiles,
    }));
  }

  async create(dto: CreateHobbyDto) {
    await this.ensureNameIsFree(dto.name);
    return this.prisma.hobby.create({
      data: {
        name: dto.name,
        category: dto.category ?? DEFAULT_HOBBY_CATEGORY,
      },
    });
  }

  async update(id: string, dto: UpdateHobbyDto) {
    await this.requireById(id);
    if (dto.name) {
      await this.ensureNameIsFree(dto.name, id);
    }
    return this.prisma.hobby.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.requireById(id);
    const inUse = await this.prisma.profileHobby.count({
      where: { hobbyId: id },
    });
    if (inUse > 0) {
      throw new ConflictException(
        `${inUse} profile(s) still use this hobby. Rename it instead.`,
      );
    }

    await this.prisma.hobby.delete({ where: { id } });
    return { id };
  }

  private async requireById(id: string) {
    const hobby = await this.prisma.hobby.findUnique({ where: { id } });
    if (!hobby) {
      throw new NotFoundException('Hobby not found.');
    }
    return hobby;
  }

  private async ensureNameIsFree(name: string, ownerId?: string) {
    const owner = await this.prisma.hobby.findUnique({ where: { name } });
    if (owner && owner.id !== ownerId) {
      throw new ConflictException('That hobby already exists.');
    }
  }
}
