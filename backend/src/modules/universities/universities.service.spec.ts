import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UniversitiesService } from './universities.service';

const EAFIT = {
  id: 'uni_eafit',
  domain: 'eafit.edu.co',
  name: 'EAFIT',
  city: 'Medellín',
  active: true,
};

function setup(found: unknown = EAFIT) {
  const findMany = jest.fn().mockResolvedValue([EAFIT]);
  const findUnique = jest.fn().mockResolvedValue(found);
  const create = jest.fn().mockResolvedValue(EAFIT);
  const update = jest.fn().mockResolvedValue(EAFIT);
  const prisma = {
    university: { findMany, findUnique, create, update },
  } as unknown as PrismaService;

  return {
    service: new UniversitiesService(prisma),
    findMany,
    findUnique,
    create,
    update,
  };
}

describe('UniversitiesService', () => {
  describe('reads', () => {
    it('lists every university alphabetically', async () => {
      const { service, findMany } = setup();

      await service.findAll();

      expect(findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    });

    it('lists only active universities for the catalog', async () => {
      const { service, findMany } = setup();

      await service.findActive();

      expect(findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
    });

    it('looks a university up by the email domain, normalized', async () => {
      const { service, findUnique } = setup();

      await service.findByEmail('  Ana@EAFIT.edu.co ');

      expect(findUnique).toHaveBeenCalledWith({
        where: { domain: 'eafit.edu.co' },
      });
    });
  });

  describe('isSupportedEmail', () => {
    it('accepts a registered active domain', async () => {
      expect(await setup().service.isSupportedEmail('a@eafit.edu.co')).toBe(
        true,
      );
    });

    it('rejects an unknown domain', async () => {
      expect(await setup(null).service.isSupportedEmail('a@gmail.com')).toBe(
        false,
      );
    });

    it('rejects a domain that was deactivated', async () => {
      const { service } = setup({ ...EAFIT, active: false });

      expect(await service.isSupportedEmail('a@eafit.edu.co')).toBe(false);
    });
  });

  describe('nameForEmail', () => {
    it('returns the stored name', async () => {
      expect(await setup().service.nameForEmail('a@eafit.edu.co')).toBe(
        'EAFIT',
      );
    });

    it('falls back to a generic label for an unknown domain', async () => {
      expect(await setup(null).service.nameForEmail('a@gmail.com')).toBe(
        'Universidad verificada',
      );
    });
  });

  describe('writes', () => {
    it('creates a university active by default', async () => {
      const { service, create } = setup(null);

      await service.create({
        domain: 'unal.edu.co',
        name: 'Nacional',
        city: 'Bogotá',
      });

      expect(create).toHaveBeenCalledWith({
        data: {
          domain: 'unal.edu.co',
          name: 'Nacional',
          city: 'Bogotá',
          active: true,
        },
      });
    });

    it('refuses a domain that already exists', async () => {
      const { service } = setup();

      await expect(
        service.create({
          domain: 'eafit.edu.co',
          name: 'Otra',
          city: 'Medellín',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects updating a university that does not exist', async () => {
      const { service } = setup(null);

      await expect(service.update('ghost', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lets a university keep its own domain on update', async () => {
      const { service, update } = setup();

      await service.update('uni_eafit', { domain: 'eafit.edu.co' });

      expect(update).toHaveBeenCalled();
    });

    it('refuses to move a domain onto another university', async () => {
      const { service, findUnique } = setup();
      findUnique
        .mockResolvedValueOnce({ ...EAFIT, id: 'uni_upb' })
        .mockResolvedValueOnce(EAFIT);

      await expect(
        service.update('uni_upb', { domain: 'eafit.edu.co' }),
      ).rejects.toThrow(ConflictException);
    });

    it('deactivates instead of deleting', async () => {
      const { service, update } = setup();

      await service.deactivate('uni_eafit');

      expect(update).toHaveBeenCalledWith({
        where: { id: 'uni_eafit' },
        data: { active: false },
      });
    });

    it('rejects deactivating a university that does not exist', async () => {
      const { service } = setup(null);

      await expect(service.deactivate('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
