import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UniversitiesService } from '../universities/universities.service';
import { ProfilePhotosService } from './profile-photos.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly photos: ProfilePhotosService,
    private readonly universities: UniversitiesService,
  ) {}

  async save(
    userId: string,
    email: string,
    dto: CreateProfileDto,
    files: Express.Multer.File[],
  ) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
    const ownedUrls = new Set(existing?.photos.map((photo) => photo.url) ?? []);

    const photoUrls = await this.photos.resolveUrls(
      dto.photoManifest,
      files,
      ownedUrls,
    );
    const university = await this.universities.nameForEmail(email);
    const saved = await this.persist(userId, university, dto, photoUrls);
    await this.photos.removeUnused(ownedUrls, photoUrls);

    return saved;
  }

  getByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
  }

  setAvailability(userId: string, status: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { status },
      include: { photos: true },
    });
  }

  private persist(
    userId: string,
    university: string,
    dto: CreateProfileDto,
    photoUrls: string[],
  ) {
    const data = {
      name: dto.name,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      height: dto.height,
      biography: dto.biography,
      university,
      major: dto.major,
      semester: dto.semester,
    };

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      });

      await tx.photo.deleteMany({ where: { profileId: profile.id } });
      await tx.photo.createMany({
        data: photoUrls.map((url, index) => ({
          profileId: profile.id,
          url,
          isPrimary: index === 0,
        })),
      });

      return tx.profile.findUniqueOrThrow({
        where: { id: profile.id },
        include: { photos: true },
      });
    });
  }
}
