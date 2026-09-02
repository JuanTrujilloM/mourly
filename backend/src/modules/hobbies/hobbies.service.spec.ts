import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { HobbiesService } from './hobbies.service';

const CINE = { id: 'h1', name: 'Cine', category: 'Cultura' };

function setup(found: unknown = CINE, usageCount = 0) {
  const findMany = jest
    .fn()
    .mockResolvedValue([{ ...CINE, _count: { profiles: 3 } }]);
  const findUnique = jest.fn().mockResolvedValue(found);
  const create = jest.fn().mockResolvedValue(CINE);
  const update = jest.fn().mockResolvedValue(CINE);
  const remove = jest.fn().mockResolvedValue(CINE);
  const count = jest.fn().mockResolvedValue(usageCount);

  const prisma = {
    hobby: { findMany, findUnique, create, update, delete: remove },
    profileHobby: { count },
  } as unknown as PrismaService;

  return {
    service: new HobbiesService(prisma),
    findMany,
    findUnique,
    create,
    update,
    remove,
  };
}

describe('HobbiesService', () => {
  it('lists hobbies with how many profiles use each one', async () => {
    const { service } = setup();

    expect(await service.findAll()).toEqual([
      { id: 'h1', name: 'Cine', category: 'Cultura', profileCount: 3 },
    ]);
  });

  it('orders by category and then name so the panel is stable', async () => {
    const { service, findMany } = setup();

    await service.findAll();

    expect(findMany.mock.calls[0][0].orderBy).toEqual([
      { category: 'asc' },
      { name: 'asc' },
    ]);
  });

  it('creates a hobby with the default category', async () => {
    const { service, create } = setup(null);

    await service.create({ name: 'Escalada' });

    expect(create).toHaveBeenCalledWith({
      data: { name: 'Escalada', category: 'general' },
    });
  });

  it('keeps an explicit category', async () => {
    const { service, create } = setup(null);

    await service.create({ name: 'Escalada', category: 'Deporte' });

    expect(create.mock.calls[0][0].data.category).toBe('Deporte');
  });

  it('refuses a duplicate name', async () => {
    const { service } = setup();

    await expect(service.create({ name: 'Cine' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('rejects updating a hobby that does not exist', async () => {
    const { service } = setup(null);

    await expect(service.update('ghost', { name: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lets a hobby keep its own name on update', async () => {
    const { service, update } = setup();

    await service.update('h1', { name: 'Cine' });

    expect(update).toHaveBeenCalled();
  });

  it('refuses to move a name onto another hobby', async () => {
    const { service, findUnique } = setup();
    findUnique
      .mockResolvedValueOnce({ ...CINE, id: 'h2' })
      .mockResolvedValueOnce(CINE);

    await expect(service.update('h2', { name: 'Cine' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('refuses to delete a hobby profiles still use', async () => {
    const { service } = setup(CINE, 4);

    await expect(service.remove('h1')).rejects.toThrow(/4 profile/);
  });

  it('deletes an unused hobby', async () => {
    const { service, remove } = setup(CINE, 0);

    expect(await service.remove('h1')).toEqual({ id: 'h1' });
    expect(remove).toHaveBeenCalledWith({ where: { id: 'h1' } });
  });

  it('rejects deleting a hobby that does not exist', async () => {
    const { service } = setup(null);

    await expect(service.remove('ghost')).rejects.toThrow(NotFoundException);
  });
});
