import { GoneException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  AvailabilityLinkService,
  LinkValidation,
} from '../availability-link/availability-link.service';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';
import { FlowProfileService } from './flow-profile.service';

const CREATED_AT = new Date('2026-09-24T00:00:00.000Z');

const okLink = (
  step: 'VENUE' | 'AVAILABILITY' | 'DATE',
  userId = 'u1',
): LinkValidation => ({
  status: 'ok',
  link: { id: 'link-1', matchId: 'm1', userId, step },
});

function userWith(
  name: string,
  hobbies: string[],
  photos: { url: string; isPrimary: boolean }[] = [],
) {
  return {
    profile: {
      name,
      dateOfBirth: new Date('2002-01-15'),
      university: name.startsWith('Miguel') ? 'CES' : 'EAFIT',
      major: name.startsWith('Miguel') ? 'Psicología' : 'Música',
      semester: '7',
      biography: 'Teatro, cine club y caminatas.',
      photos,
      hobbies: hobbies.map((hobby) => ({ hobby: { name: hobby } })),
    },
  };
}

const MATCH = {
  userAId: 'u1',
  createdAt: CREATED_AT,
  userA: userWith('Felipe Cardona', ['Teatro', 'Música en vivo']),
  userB: userWith(
    'Miguel Ángel Torres',
    ['Senderismo', 'Teatro', 'Cine'],
    [
      { url: 'https://cdn/second.jpg', isPrimary: false },
      { url: 'https://cdn/primary.jpg', isPrimary: true },
    ],
  ),
};

function build(validation: LinkValidation, match: unknown = MATCH) {
  const links = { validate: jest.fn().mockResolvedValue(validation) };
  const findUnique = jest.fn().mockResolvedValue(match);
  const prisma = { match: { findUnique } } as unknown as PrismaService;
  const service = new FlowProfileService(
    prisma,
    new AvailabilityLinkResolver(links as unknown as AvailabilityLinkService),
  );
  return { service, findUnique };
}

describe('FlowProfileService', () => {
  it('names the partner by first name and puts the primary photo first', async () => {
    const { service } = build(okLink('VENUE'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.step).toBe('VENUE');
    expect(view.partner).toEqual({
      firstName: 'Miguel',
      age: expect.any(Number),
      university: 'CES',
      major: 'Psicología',
      semester: '7',
      biography: 'Teatro, cine club y caminatas.',
      photos: ['https://cdn/primary.jpg', 'https://cdn/second.jpg'],
    });
  });

  it('shows only the hobbies both people share', async () => {
    const { service } = build(okLink('VENUE'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.sharedHobbies).toEqual(['Teatro']);
  });

  it('shows user A to user B', async () => {
    const { service } = build(okLink('VENUE', 'u2'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.partner.firstName).toBe('Felipe');
    expect(view.partner.photos).toEqual([]);
  });

  it('closes 48 hours after the match was created', async () => {
    const { service } = build(okLink('VENUE'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.closesAt).toBe('2026-09-26T00:00:00.000Z');
  });

  it('keeps the AVAILABILITY step so the page skips places', async () => {
    const { service } = build(okLink('AVAILABILITY'));

    const view = await service.getProfileView('t');

    expect(view.step).toBe('AVAILABILITY');
  });

  it('reports a date link as COMPLETED', async () => {
    const { service, findUnique } = build(okLink('DATE'));

    expect(await service.getProfileView('t')).toEqual({ step: 'COMPLETED' });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('reports a consumed link as COMPLETED', async () => {
    const { service } = build({ status: 'consumed' });

    expect(await service.getProfileView('t')).toEqual({ step: 'COMPLETED' });
  });

  it('maps an expired link to 410 Gone', async () => {
    const { service } = build({ status: 'expired' });

    await expect(service.getProfileView('t')).rejects.toThrow(GoneException);
  });

  it('maps an unknown link to 404', async () => {
    const { service } = build({ status: 'invalid' });

    await expect(service.getProfileView('t')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('maps a partner without profile to 404', async () => {
    const { service } = build(okLink('VENUE'), {
      ...MATCH,
      userB: { profile: null },
    });

    await expect(service.getProfileView('t')).rejects.toThrow(
      NotFoundException,
    );
  });
});
