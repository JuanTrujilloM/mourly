import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { JwtStrategy } from './jwt.strategy';

function buildStrategy() {
  const config = {
    getOrThrow: () => 'a-secret-long-enough-for-tests-000000',
  } as unknown as ConfigService;
  return new JwtStrategy(config);
}

describe('JwtStrategy', () => {
  it('maps the token payload onto the authenticated user', () => {
    const strategy = buildStrategy();

    expect(strategy.validate({ sub: 'u1', email: 'ana@eafit.edu.co' })).toEqual(
      { userId: 'u1', email: 'ana@eafit.edu.co' },
    );
  });

  it('reads the access token from the cookie', () => {
    buildStrategy();
    const extractor = jest.requireMock('passport-jwt').ExtractJwt.fromExtractors
      .mock.calls[0][0][0] as (request: Request) => string | null;

    expect(
      extractor({ cookies: { access_token: 'abc' } } as unknown as Request),
    ).toBe('abc');
    expect(extractor({} as unknown as Request)).toBeNull();
  });
});

jest.mock('passport-jwt', () => {
  const actual = jest.requireActual('passport-jwt');
  return {
    ...actual,
    ExtractJwt: { fromExtractors: jest.fn(() => () => null) },
  };
});
