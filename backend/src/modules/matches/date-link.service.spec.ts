import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { DateLinkService } from './date-link.service';

const SCHEDULED_AT = new Date('2026-09-22T17:00:00Z');

function setup(env: Record<string, string> = {}) {
  const links = { issueDateLink: jest.fn().mockResolvedValue('tok') };
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const service = new DateLinkService(
    config,
    links as unknown as AvailabilityLinkService,
  );
  return { service, links };
}

describe('DateLinkService', () => {
  it('builds the date page url on the configured frontend', async () => {
    const { service } = setup({ FRONTEND_URL: 'https://mourly.com' });

    expect(await service.urlFor('m1', 'u1', SCHEDULED_AT)).toBe(
      'https://mourly.com/cita/tok',
    );
  });

  it('keeps the link alive until a day after the date', async () => {
    const { service, links } = setup();

    await service.urlFor('m1', 'u1', SCHEDULED_AT);

    expect(links.issueDateLink).toHaveBeenCalledWith(
      'm1',
      'u1',
      new Date('2026-09-23T17:00:00Z'),
    );
  });

  it('returns null instead of throwing when the link cannot be issued', async () => {
    const { service, links } = setup();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    links.issueDateLink.mockRejectedValue(new Error('db down'));

    expect(await service.urlFor('m1', 'u1', SCHEDULED_AT)).toBeNull();
  });
});
