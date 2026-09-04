import { GoneException, NotFoundException } from '@nestjs/common';
import { LinkValidation } from '../availability-link/availability-link.service';
import { TIME_SLOTS } from './availability.constants';
import { buildAvailabilityHarness } from './test-setup';

const OK_VENUE: LinkValidation = {
  status: 'ok',
  link: { id: 'link-0', matchId: 'm1', userId: 'u1', step: 'VENUE' },
};
const OK_AVAILABILITY: LinkValidation = {
  status: 'ok',
  link: { id: 'link-0', matchId: 'm1', userId: 'u1', step: 'AVAILABILITY' },
};

describe('AvailabilityViewService', () => {
  describe('getAvailabilityView', () => {
    it('returns 7 days and the fixed 12pm-7pm slots', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      const view = await viewService.getAvailabilityView('t');

      if (view.step !== 'AVAILABILITY') throw new Error('expected calendar');
      expect(view.days).toHaveLength(7);
      expect(view.timeSlots).toEqual([...TIME_SLOTS]);
      expect(view.partnerName).toBe('Beto');
    });

    it('starts the window the day after the match was created', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      const view = await viewService.getAvailabilityView('t');

      if (view.step !== 'AVAILABILITY') throw new Error('expected calendar');
      expect(view.days[0].date).toBe('2026-07-10');
      expect(view.days[6].date).toBe('2026-07-16');
    });

    it('signals a redirect when places are not chosen yet', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_VENUE);

      expect(await viewService.getAvailabilityView('t')).toEqual({
        step: 'VENUE',
      });
    });

    it('reports a consumed link as COMPLETED instead of an error', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue({ status: 'consumed' });

      expect(await viewService.getAvailabilityView('t')).toEqual({
        step: 'COMPLETED',
      });
    });

    it('maps an expired link to 410 Gone', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue({ status: 'expired' });

      await expect(viewService.getAvailabilityView('t')).rejects.toThrow(
        GoneException,
      );
    });

    it('maps an unknown link to 404', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue({ status: 'invalid' });

      await expect(viewService.getAvailabilityView('t')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('falls back to a null partner name when the match is gone', async () => {
      const { viewService, links, findUnique } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      findUnique.mockResolvedValue(null);

      const view = await viewService.getAvailabilityView('t');

      if (view.step !== 'AVAILABILITY') throw new Error('expected calendar');
      expect(view.partnerName).toBeNull();
    });
  });

  describe('getVenuesView', () => {
    it('serves the suggestions scoped to the link match and user', async () => {
      const { viewService, links, venues } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_VENUE);
      venues.getSuggestions.mockResolvedValue([{ id: 'v1' }]);

      const view = await viewService.getVenuesView('t');

      if (view.step !== 'VENUE') throw new Error('expected venues');
      expect(view.venues).toEqual([{ id: 'v1' }]);
      expect(view.partnerName).toBe('Beto');
      expect(view.minSelection).toBe(2);
      expect(venues.getSuggestions).toHaveBeenCalledWith('m1', 'u1');
    });

    it('signals a redirect when places are already chosen', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      expect(await viewService.getVenuesView('t')).toEqual({
        step: 'AVAILABILITY',
      });
    });

    it('reports a consumed link as COMPLETED instead of an error', async () => {
      const { viewService, links } = buildAvailabilityHarness();
      links.validate.mockResolvedValue({ status: 'consumed' });

      expect(await viewService.getVenuesView('t')).toEqual({
        step: 'COMPLETED',
      });
    });
  });
});
