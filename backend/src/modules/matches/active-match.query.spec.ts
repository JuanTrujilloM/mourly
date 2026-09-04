import { activeMatchWhere } from './active-match.query';

describe('activeMatchWhere', () => {
  it('matches the user on either side of the pair', () => {
    expect(activeMatchWhere('u1').OR).toEqual([
      { userAId: 'u1' },
      { userBId: 'u1' },
    ]);
  });

  it('limits the query to active statuses', () => {
    expect(activeMatchWhere('u1').status).toEqual({
      in: ['pending', 'confirmed'],
    });
  });
});
