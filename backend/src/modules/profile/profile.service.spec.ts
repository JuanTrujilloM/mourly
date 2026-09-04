import { PrismaService } from '../../config/prisma.service';
import { ProfilePhotosService } from './profile-photos.service';
import { ProfileService } from './profile.service';
import { UniversitiesService } from '../universities/universities.service';
import { CreateProfileDto } from './dto/create-profile.dto';

const DTO = {
  name: 'Ana',
  dateOfBirth: '2003-04-12',
  gender: 'Femenino',
  height: 166,
  biography: 'Cine y cafe',
  major: 'Derecho',
  semester: '6',
} as CreateProfileDto;

function setup(existing: unknown = null) {
  const profileFindUnique = jest.fn().mockResolvedValue(existing);
  const upsert = jest.fn().mockResolvedValue({ id: 'p1' });
  const findUniqueOrThrow = jest.fn().mockResolvedValue({ id: 'p1' });
  const profileUpdate = jest.fn().mockResolvedValue({ id: 'p1' });
  const photoDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const photoCreateMany = jest.fn().mockResolvedValue({ count: 1 });

  const tx = {
    profile: { upsert, findUniqueOrThrow },
    photo: { deleteMany: photoDeleteMany, createMany: photoCreateMany },
  };
  const prisma = {
    profile: { findUnique: profileFindUnique, update: profileUpdate },
    $transaction: (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx),
  } as unknown as PrismaService;

  const photos = {
    resolveUrls: jest.fn().mockResolvedValue(['https://cdn/a.jpg']),
    removeUnused: jest.fn().mockResolvedValue(undefined),
  };

  const universities = {
    nameForEmail: jest
      .fn()
      .mockImplementation((email: string) =>
        Promise.resolve(email.includes('upb') ? 'UPB' : 'EAFIT'),
      ),
  };
  const service = new ProfileService(
    prisma,
    photos as unknown as ProfilePhotosService,
    universities as unknown as UniversitiesService,
  );
  return {
    service,
    photos,
    upsert,
    photoCreateMany,
    profileUpdate,
    profileFindUnique,
  };
}

describe('ProfileService', () => {
  it('derives the university from the verified email, not the input', async () => {
    const { service, upsert } = setup();

    await service.save('u1', 'ana@upb.edu.co', DTO, []);

    expect(upsert.mock.calls[0][0].create.university).toBe('UPB');
  });

  it('never lets the client set the matching status', async () => {
    const { service, upsert } = setup();

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(upsert.mock.calls[0][0].update).not.toHaveProperty('status');
  });

  it('marks the first photo as primary', async () => {
    const { service, photos, photoCreateMany } = setup();
    photos.resolveUrls.mockResolvedValue([
      'https://cdn/a.jpg',
      'https://cdn/b.jpg',
    ]);

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    const rows = photoCreateMany.mock.calls[0][0].data as {
      isPrimary: boolean;
    }[];
    expect(rows.map((row) => row.isPrimary)).toEqual([true, false]);
  });

  it('passes the previously owned urls to the photo resolver', async () => {
    const { service, photos } = setup({
      id: 'p1',
      photos: [{ url: 'https://cdn/old.jpg' }],
    });

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(photos.resolveUrls.mock.calls[0][2]).toEqual(
      new Set(['https://cdn/old.jpg']),
    );
  });

  it('cleans up dropped photos after the write commits', async () => {
    const { service, photos } = setup({
      id: 'p1',
      photos: [{ url: 'https://cdn/old.jpg' }],
    });

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(photos.removeUnused).toHaveBeenCalledWith(
      new Set(['https://cdn/old.jpg']),
      ['https://cdn/a.jpg'],
    );
  });

  it('parses the birth date into a Date', async () => {
    const { service, upsert } = setup();

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(upsert.mock.calls[0][0].create.dateOfBirth).toBeInstanceOf(Date);
  });

  it('reads the saved profile with its photos', async () => {
    const { service, profileFindUnique } = setup();

    await service.getByUserId('u1');

    expect(profileFindUnique).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      include: { photos: true },
    });
  });

  it('updates only the status when toggling availability', async () => {
    const { service, profileUpdate } = setup();

    await service.setAvailability('u1', 'PAUSED');

    expect(profileUpdate).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      data: { status: 'PAUSED' },
      include: { photos: true },
    });
  });
});
