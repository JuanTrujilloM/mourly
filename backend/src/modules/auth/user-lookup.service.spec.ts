import { PrismaService } from '../../config/prisma.service';
import { UserLookupService } from './user-lookup.service';

function setup(result: unknown) {
  const findUnique = jest.fn().mockResolvedValue(result);
  const findFirst = jest.fn().mockResolvedValue(result);
  const prisma = {
    user: { findUnique, findFirst },
  } as unknown as PrismaService;
  return { service: new UserLookupService(prisma), findUnique, findFirst };
}

describe('UserLookupService', () => {
  it('looks a user up by email', async () => {
    const { service, findUnique } = setup({ id: 'u1' });

    await service.findByEmail('ana@eafit.edu.co');

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'ana@eafit.edu.co' },
    });
  });

  it('only counts a cellphone another account has verified', async () => {
    const { service, findFirst } = setup(null);

    await service.isCellphoneVerifiedByAnother('+573001112233', 'u1');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        cellphone: '+573001112233',
        cellphoneVerifiedAt: { not: null },
        id: { not: 'u1' },
      },
      select: { id: true },
    });
  });

  it('reports a free or unverified cellphone as available', async () => {
    const { service } = setup(null);

    expect(
      await service.isCellphoneVerifiedByAnother('+573001112233', 'u1'),
    ).toBe(false);
  });

  it('reports a cellphone verified by another account as taken', async () => {
    const { service } = setup({ id: 'other' });

    expect(
      await service.isCellphoneVerifiedByAnother('+573001112233', 'u1'),
    ).toBe(true);
  });
});
