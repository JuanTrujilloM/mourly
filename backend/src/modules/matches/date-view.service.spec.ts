import { GoneException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  AvailabilityLinkService,
  type LinkValidation,
} from '../availability-link/availability-link.service';
import { DateViewService } from './date-view.service';

const OK_DATE: LinkValidation = {
  status: 'ok',
  link: { id: 'link-1', matchId: 'm1', userId: 'a', step: 'DATE' },
};

function user(name: string, university: string, hobbies: string[]) {
  return {
    profile: {
      name,
      dateOfBirth: new Date('2004-01-01'),
      university,
      major: 'Diseño',
      biography: 'Café y montaña',
      photos: [{ url: `https://cdn/${name}.jpg`, isPrimary: true }],
      hobbies: hobbies.map((hobby) => ({ hobby: { name: hobby } })),
    },
  };
}

function datedMatch(overrides: Record<string, unknown> = {}) {
  return {
    userAId: 'a',
    userA: user('Ana', 'EAFIT', ['Cine', 'Ciclismo']),
    userB: user('Beto', 'UPB', ['Ciclismo', 'Yoga']),
    date: {
      scheduledAt: new Date('2026-09-22T17:00:00Z'),
      venue: { name: 'Pergamino', address: 'Cra 37 #8A-37' },
    },
    ...overrides,
  };
}

function setup(
  validation: LinkValidation = OK_DATE,
  match: unknown = datedMatch(),
) {
  const prisma = {
    match: { findUnique: jest.fn().mockResolvedValue(match) },
  } as unknown as PrismaService;
  const links = { validate: jest.fn().mockResolvedValue(validation) };
  const service = new DateViewService(
    prisma,
    links as unknown as AvailabilityLinkService,
  );
  return { service };
}

describe('DateViewService', () => {
  it('shows the date from the side of the link holder', async () => {
    const { service } = setup();

    const view = await service.getView('t');

    expect(view.viewer).toEqual({ name: 'Ana', university: 'EAFIT' });
    expect(view.partner.name).toBe('Beto');
    expect(view.partner.university).toBe('UPB');
    expect(view.venue).toEqual({ name: 'Pergamino', address: 'Cra 37 #8A-37' });
    expect(view.scheduledAt).toBe('2026-09-22T17:00:00.000Z');
  });

  it('flips the sides for the other user', async () => {
    const { service } = setup({
      status: 'ok',
      link: { id: 'link-2', matchId: 'm1', userId: 'b', step: 'DATE' },
    });

    const view = await service.getView('t');

    expect(view.viewer.name).toBe('Beto');
    expect(view.partner.name).toBe('Ana');
  });

  it('lists only the hobbies they share', async () => {
    const { service } = setup();

    expect((await service.getView('t')).sharedHobbies).toEqual(['Ciclismo']);
  });

  it('refuses a scheduling-flow link', async () => {
    const { service } = setup({
      status: 'ok',
      link: { id: 'link-1', matchId: 'm1', userId: 'a', step: 'AVAILABILITY' },
    });

    await expect(service.getView('t')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps an unknown token to 404', async () => {
    const { service } = setup({ status: 'invalid' });

    await expect(service.getView('t')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps an expired link to 410 Gone', async () => {
    const { service } = setup({ status: 'expired' });

    await expect(service.getView('t')).rejects.toBeInstanceOf(GoneException);
  });

  it('answers 410 when the match has no date anymore', async () => {
    const { service } = setup(OK_DATE, datedMatch({ date: null }));

    await expect(service.getView('t')).rejects.toBeInstanceOf(GoneException);
  });
});
