import { PrismaService } from '../../config/prisma.service';
import { MatchesService } from './matches.service';

const PROFILE = {
  name: 'Beto',
  dateOfBirth: new Date('2002-01-01'),
  university: 'CES',
  major: 'Medicina',
  biography: 'Corro maratones',
  photos: [{ url: 'https://cdn/b.jpg', isPrimary: true }],
};

function setup(match: unknown) {
  const findFirst = jest.fn().mockResolvedValue(match);
  const prisma = { match: { findFirst } } as unknown as PrismaService;
  return { service: new MatchesService(prisma), findFirst };
}

describe('MatchesService', () => {
  it('returns null when there is no active match', async () => {
    const { service } = setup(null);

    expect(await service.getCurrentMatch('u1')).toBeNull();
  });

  it('returns the other user as the partner when the caller is userA', async () => {
    const { service } = setup({
      id: 'm1',
      status: 'pending',
      userAId: 'u1',
      userBId: 'u2',
      userA: { profile: null },
      userB: { profile: PROFILE },
    });

    const current = await service.getCurrentMatch('u1');

    expect(current).toMatchObject({ id: 'm1', status: 'pending' });
    expect(current?.partner?.name).toBe('Beto');
  });

  it('returns the other user as the partner when the caller is userB', async () => {
    const { service } = setup({
      id: 'm1',
      status: 'pending',
      userAId: 'u2',
      userBId: 'u1',
      userA: { profile: PROFILE },
      userB: { profile: null },
    });

    expect((await service.getCurrentMatch('u1'))?.partner?.name).toBe('Beto');
  });

  it('asks only for active matches, newest first', async () => {
    const { service, findFirst } = setup(null);

    await service.getCurrentMatch('u1');

    expect(findFirst.mock.calls[0][0].where.status).toEqual({
      in: ['pending', 'confirmed'],
    });
    expect(findFirst.mock.calls[0][0].orderBy).toEqual({ createdAt: 'desc' });
  });
});
