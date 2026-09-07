import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UniversitiesService } from '../universities/universities.service';
import { WaitlistService } from './waitlist.service';
import { ALREADY_SUPPORTED_MESSAGE, JOINED_MESSAGE } from './waitlist.messages';

const ENTRY = {
  name: '  Emmanuel Maya  ',
  email: 'Emaya@correo.iue.edu.co',
  cellphone: '+573014983968',
};

function setup(supported: boolean) {
  const prisma = {
    waitlistEntry: { upsert: jest.fn(), findMany: jest.fn() },
  };
  const universities = {
    isSupportedEmail: jest.fn().mockResolvedValue(supported),
  };
  return {
    prisma,
    service: new WaitlistService(
      prisma as unknown as PrismaService,
      universities as unknown as UniversitiesService,
    ),
  };
}

describe('WaitlistService', () => {
  it('stores a lead from a university Mourly has not reached', async () => {
    const { service, prisma } = setup(false);

    await expect(service.join(ENTRY)).resolves.toEqual({
      message: JOINED_MESSAGE,
    });
    expect(prisma.waitlistEntry.upsert).toHaveBeenCalledWith({
      where: { email: 'emaya@correo.iue.edu.co' },
      create: {
        email: 'emaya@correo.iue.edu.co',
        domain: 'correo.iue.edu.co',
        name: 'Emmanuel Maya',
        cellphone: ENTRY.cellphone,
      },
      update: { name: 'Emmanuel Maya', cellphone: ENTRY.cellphone },
    });
  });

  it('overwrites the contact details when the same email comes back', async () => {
    const { service, prisma } = setup(false);

    await service.join(ENTRY);

    const [{ create, update }] = prisma.waitlistEntry.upsert.mock.calls[0] as [
      { create: unknown; update: unknown },
    ];
    expect(create).toMatchObject(update as object);
  });

  it('turns away a student whose university is already supported', async () => {
    const { service, prisma } = setup(true);

    await expect(service.join(ENTRY)).rejects.toThrow(
      new BadRequestException(ALREADY_SUPPORTED_MESSAGE),
    );
    expect(prisma.waitlistEntry.upsert).not.toHaveBeenCalled();
  });

  it('lists the newest leads first', async () => {
    const { service, prisma } = setup(false);
    prisma.waitlistEntry.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prisma.waitlistEntry.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });
});
