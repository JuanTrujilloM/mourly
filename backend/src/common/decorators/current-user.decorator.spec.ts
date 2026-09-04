import { extractCurrentUser } from './current-user.decorator';
import { executionContextWith } from '../test-context';

describe('extractCurrentUser', () => {
  it('returns the user Passport attached to the request', () => {
    const user = { userId: 'u1', email: 'a@eafit.edu.co' };

    expect(extractCurrentUser(executionContextWith({ user }))).toBe(user);
  });
});
