import { ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { executionContextWith } from '../test-context';

describe('AdminGuard', () => {
  const guard = new AdminGuard();
  const original = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'admin@eafit.edu.co';
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = original;
  });

  it('allows an allowlisted admin through', () => {
    const context = executionContextWith({
      user: { userId: 'u1', email: 'admin@eafit.edu.co' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects an authenticated user outside the allowlist', () => {
    const context = executionContextWith({
      user: { userId: 'u2', email: 'student@eafit.edu.co' },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects a request with no authenticated user', () => {
    expect(() => guard.canActivate(executionContextWith({}))).toThrow(
      ForbiddenException,
    );
  });
});
