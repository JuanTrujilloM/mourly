import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { getEmailDomain } from './email-domain';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

const FALLBACK_UNIVERSITY_NAME = 'Universidad verificada';

@Injectable()
export class UniversitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.university.findMany({ orderBy: { name: 'asc' } });
  }

  findActive() {
    return this.prisma.university.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  findByEmail(email: string) {
    return this.prisma.university.findUnique({
      where: { domain: getEmailDomain(email) },
    });
  }

  async isSupportedEmail(email: string): Promise<boolean> {
    const university = await this.findByEmail(email);
    return university !== null && university.active;
  }

  async nameForEmail(email: string): Promise<string> {
    const university = await this.findByEmail(email);
    return university?.name ?? FALLBACK_UNIVERSITY_NAME;
  }

  async create(dto: CreateUniversityDto) {
    await this.ensureDomainIsFree(dto.domain);
    return this.prisma.university.create({
      data: { ...dto, active: dto.active ?? true },
    });
  }

  async update(id: string, dto: UpdateUniversityDto) {
    await this.requireById(id);
    if (dto.domain) {
      await this.ensureDomainIsFree(dto.domain, id);
    }
    return this.prisma.university.update({ where: { id }, data: dto });
  }

  async deactivate(id: string) {
    await this.requireById(id);
    return this.prisma.university.update({
      where: { id },
      data: { active: false },
    });
  }

  private async requireById(id: string) {
    const university = await this.prisma.university.findUnique({
      where: { id },
    });
    if (!university) {
      throw new NotFoundException('University not found.');
    }
    return university;
  }

  private async ensureDomainIsFree(domain: string, ownerId?: string) {
    const owner = await this.prisma.university.findUnique({
      where: { domain },
    });
    if (owner && owner.id !== ownerId) {
      throw new ConflictException('That domain is already registered.');
    }
  }
}
