import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { PhotoUrlService } from '../storage/photo-url.service';
import { UniversitiesService } from '../universities/universities.service';
import { ProfilePhotosService } from './profile-photos.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly photos: ProfilePhotosService,
    private readonly universities: UniversitiesService,
    private readonly photoUrls: PhotoUrlService,
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
    const ownedKeys = new Map(
      existing?.photos.map((photo) => [photo.id, photo.key]) ?? [],
    );

    const photoKeys = await this.photos.resolveKeys(
      dto.photoManifest,
      files,
      ownedKeys,
    );
    const university = await this.universities.nameForEmail(email);
    const saved = await this.persist(userId, university, dto, photoKeys);
    await this.photos.removeUnused([...ownedKeys.values()], photoKeys);

    return this.photoUrls.withSignedPhotos(saved);
  }

  async getByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
    return profile && this.photoUrls.withSignedPhotos(profile);
  }

  async setAvailability(userId: string, status: string) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { status },
      include: { photos: true },
    });
    return this.photoUrls.withSignedPhotos(profile);
  }

  private persist(
    userId: string,
    university: string,
    dto: CreateProfileDto,
    photoKeys: string[],
  ) {
    const editable = {
      name: dto.name,
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
        create: { userId, dateOfBirth: new Date(dto.dateOfBirth), ...editable },
        update: editable,
      });

      await tx.photo.deleteMany({ where: { profileId: profile.id } });
      await tx.photo.createMany({
        data: photoKeys.map((key, index) => ({
          profileId: profile.id,
          key,
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
