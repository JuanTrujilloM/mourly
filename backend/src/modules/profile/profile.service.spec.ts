import { PrismaService } from '../../config/prisma.service';
import { ProfilePhotosService } from './profile-photos.service';
import { ProfileService } from './profile.service';
import { setupPhotoUrlService } from '../storage/storage.test-helpers';
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

const SAVED_PROFILE = {
  id: 'p1',
  photos: [{ id: 'photo-1', key: 'profiles/a.jpg', isPrimary: true }],
};

const SIGNED_PHOTOS = [
  {
    id: 'photo-1',
    isPrimary: true,
    url: 'https://signed/page/profiles/a.jpg',
  },
];

function setup(existing: unknown = null) {
  const profileFindUnique = jest.fn().mockResolvedValue(existing);
  const upsert = jest.fn().mockResolvedValue({ id: 'p1' });
  const findUniqueOrThrow = jest.fn().mockResolvedValue(SAVED_PROFILE);
  const profileUpdate = jest.fn().mockResolvedValue(SAVED_PROFILE);
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
    resolveKeys: jest.fn().mockResolvedValue(['profiles/a.jpg']),
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
    setupPhotoUrlService().photoUrls,
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
    photos.resolveKeys.mockResolvedValue(['profiles/a.jpg', 'profiles/b.jpg']);

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    const rows = photoCreateMany.mock.calls[0][0].data as {
      isPrimary: boolean;
    }[];
    expect(rows.map((row) => row.isPrimary)).toEqual([true, false]);
  });

  it('passes the owned photo keys, by photo id, to the resolver', async () => {
    const { service, photos } = setup({
      id: 'p1',
      photos: [{ id: 'photo-1', key: 'profiles/old.jpg' }],
    });

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(photos.resolveKeys.mock.calls[0][2]).toEqual(
      new Map([['photo-1', 'profiles/old.jpg']]),
    );
  });

  it('cleans up dropped photos after the write commits', async () => {
    const { service, photos } = setup({
      id: 'p1',
      photos: [{ id: 'photo-1', key: 'profiles/old.jpg' }],
    });

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(photos.removeUnused).toHaveBeenCalledWith(
      ['profiles/old.jpg'],
      ['profiles/a.jpg'],
    );
  });

  it('parses the birth date into a Date', async () => {
    const { service, upsert } = setup();

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(upsert.mock.calls[0][0].create.dateOfBirth).toBeInstanceOf(Date);
  });

  it('never lets an edit change the birth date', async () => {
    const { service, upsert } = setup();

    await service.save('u1', 'ana@eafit.edu.co', DTO, []);

    expect(upsert.mock.calls[0][0].update).not.toHaveProperty('dateOfBirth');
  });

  it('reads the saved profile with its photos', async () => {
    const { service, profileFindUnique } = setup();

    await service.getByUserId('u1');

    expect(profileFindUnique).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      include: { photos: true },
    });
  });

  it('answers with signed photo urls instead of storage keys', async () => {
    const { service } = setup(SAVED_PROFILE);

    expect((await service.getByUserId('u1'))?.photos).toEqual(SIGNED_PHOTOS);
    expect(
      (await service.save('u1', 'a@eafit.edu.co', DTO, [])).photos,
    ).toEqual(SIGNED_PHOTOS);
    expect((await service.setAvailability('u1', 'PAUSED')).photos).toEqual(
      SIGNED_PHOTOS,
    );
  });

  it('answers null when the user has no profile yet', async () => {
    const { service } = setup(null);

    expect(await service.getByUserId('u1')).toBeNull();
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
