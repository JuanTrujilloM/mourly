import { PrismaService } from '../../config/prisma.service';
import { UserLookupService } from './user-lookup.service';

function setup(result: unknown) {
  const findUnique = jest.fn().mockResolvedValue(result);
  const prisma = { user: { findUnique } } as unknown as PrismaService;
  return { service: new UserLookupService(prisma), findUnique };
}

describe('UserLookupService', () => {
  it('looks a user up by email', async () => {
    const { service, findUnique } = setup({ id: 'u1' });

    await service.findByEmail('ana@eafit.edu.co');

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'ana@eafit.edu.co' },
    });
  });

  it('reports a free cellphone as available', async () => {
    const { service } = setup(null);

    expect(await service.isCellphoneTaken('+573001112233')).toBe(false);
  });

  it('reports a cellphone held by another user as taken', async () => {
    const { service } = setup({ id: 'other' });

    expect(await service.isCellphoneTaken('+573001112233', 'u1')).toBe(true);
  });

  it('does not treat the owner own cellphone as taken', async () => {
    const { service } = setup({ id: 'u1' });

    expect(await service.isCellphoneTaken('+573001112233', 'u1')).toBe(false);
  });
});
