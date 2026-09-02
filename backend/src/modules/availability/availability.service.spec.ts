import { BadRequestException, GoneException } from '@nestjs/common';
import { LinkValidation } from '../availability-link/availability-link.service';
import { buildAvailabilityHarness } from './test-setup';

const OK_VENUE: LinkValidation = {
  status: 'ok',
  link: { id: 'link-0', matchId: 'm1', userId: 'u1', step: 'VENUE' },
};
const OK_AVAILABILITY: LinkValidation = {
  status: 'ok',
  link: { id: 'link-0', matchId: 'm1', userId: 'u1', step: 'AVAILABILITY' },
};

const FIRST_DAY = '2026-07-10';

type SavedRow = {
  matchId: string;
  userId: string;
  date: Date;
  timeSlot: string;
};

describe('AvailabilityService', () => {
  describe('submitAvailability', () => {
    it('saves the slots, consumes the link, and triggers confirmation', async () => {
      const { service, links, confirmation, createMany, deleteMany } =
        buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      let savedRows: SavedRow[] = [];
      createMany.mockImplementation((args: { data: SavedRow[] }) => {
        savedRows = args.data;
        return Promise.resolve({ count: args.data.length });
      });

      const result = await service.submitAvailability('t', [
        { date: FIRST_DAY, timeSlot: '12:00' },
        { date: FIRST_DAY, timeSlot: '13:00' },
      ]);

      expect(result).toEqual({ step: 'COMPLETED' });
      expect(deleteMany).toHaveBeenCalledWith({
        where: { matchId: 'm1', userId: 'u1' },
      });
      expect(savedRows).toHaveLength(2);
      expect(savedRows.map((row) => row.timeSlot)).toEqual(['12:00', '13:00']);
      expect(savedRows.every((row) => row.date instanceof Date)).toBe(true);
      expect(
        savedRows.every((row) => row.matchId === 'm1' && row.userId === 'u1'),
      ).toBe(true);
      expect(links.consume).toHaveBeenCalledWith('link-0');
      expect(confirmation.tryConfirm).toHaveBeenCalledWith('m1');
    });

    it('stores the picked day at UTC midnight', async () => {
      const { service, links, createMany } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      let savedRows: SavedRow[] = [];
      createMany.mockImplementation((args: { data: SavedRow[] }) => {
        savedRows = args.data;
        return Promise.resolve({ count: args.data.length });
      });

      await service.submitAvailability('t', [
        { date: FIRST_DAY, timeSlot: '12:00' },
      ]);

      expect(savedRows[0].date.toISOString()).toBe('2026-07-10T00:00:00.000Z');
    });

    it('does not fail the save when the confirmation check throws', async () => {
      const { service, links, confirmation } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      confirmation.tryConfirm.mockRejectedValue(new Error('boom'));

      const result = await service.submitAvailability('t', [
        { date: FIRST_DAY, timeSlot: '12:00' },
      ]);

      expect(result).toEqual({ step: 'COMPLETED' });
    });

    it('rejects a day outside the 7-day window', async () => {
      const { service, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      await expect(
        service.submitAvailability('t', [
          { date: '2000-01-01', timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an unknown time slot', async () => {
      const { service, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      await expect(
        service.submitAvailability('t', [
          { date: FIRST_DAY, timeSlot: '09:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects duplicate slots', async () => {
      const { service, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      await expect(
        service.submitAvailability('t', [
          { date: FIRST_DAY, timeSlot: '12:00' },
          { date: FIRST_DAY, timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a submit before places are chosen', async () => {
      const { service, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_VENUE);

      await expect(
        service.submitAvailability('t', [
          { date: FIRST_DAY, timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a submit on a consumed link', async () => {
      const { service, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue({ status: 'consumed' });

      await expect(
        service.submitAvailability('t', [
          { date: FIRST_DAY, timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(GoneException);
    });
  });

  describe('selectVenues', () => {
    it('records the choice against the link match and advances the step', async () => {
      const { service, links, venues } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_VENUE);

      const result = await service.selectVenues('t', ['v1', 'v2']);

      expect(venues.select).toHaveBeenCalledWith('m1', 'u1', ['v1', 'v2']);
      expect(links.setStep).toHaveBeenCalledWith('link-0', 'AVAILABILITY');
      expect(links.consume).not.toHaveBeenCalled();
      expect(result).toMatchObject({ step: 'AVAILABILITY' });
    });

    it('rejects a second selection once past the VENUE step', async () => {
      const { service, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      await expect(service.selectVenues('t', ['v1', 'v2'])).rejects.toThrow(
        GoneException,
      );
    });
  });
});
