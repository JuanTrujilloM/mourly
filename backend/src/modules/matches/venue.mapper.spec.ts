import { toPublicVenue } from './venue.mapper';

const VENUE = {
  id: 'v1',
  name: 'Pergamino',
  type: 'Café',
  address: 'Cra 37',
  openingHours: '8-20',
  description: 'Nice',
  tags: ['café'],
  averageSpentPerPerson: 30000,
};

describe('toPublicVenue', () => {
  it('keeps the fields students are shown', () => {
    expect(toPublicVenue(VENUE)).toEqual(VENUE);
  });

  it('drops the commission rate even when present on the row', () => {
    const withCommission = { ...VENUE, commissionRate: 0.15 };

    expect(toPublicVenue(withCommission)).not.toHaveProperty('commissionRate');
  });
});
