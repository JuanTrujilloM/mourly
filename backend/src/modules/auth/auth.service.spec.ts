import { AUTH_USER, setupAuthService as setup } from './test-helpers';
import { CODE_SENT_MESSAGE } from './auth.messages';

describe('AuthService', () => {
  describe('requestCode', () => {
    it('creates the account on first contact and sends a code', async () => {
      const { service, upsert, dispatcher } = setup();

      const result = await service.requestCode({ email: 'Ana@EAFIT.edu.co' });

      expect(upsert).toHaveBeenCalledWith({
        where: { email: 'ana@eafit.edu.co' },
        update: {},
        create: { email: 'ana@eafit.edu.co' },
      });
      expect(dispatcher.dispatch).toHaveBeenCalledWith(
        'u1',
        'ana@eafit.edu.co',
      );
      expect(result).toEqual({ message: CODE_SENT_MESSAGE });
    });
  });

  describe('verify', () => {
    it('marks the email verified and issues a session', async () => {
      const { service, update, sessions } = setup();

      await service.verify({ email: 'ana@eafit.edu.co', code: '123456' });

      expect(update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isVerified: true },
      });
      expect(sessions.issueFor).toHaveBeenCalledWith('u1', 'ana@eafit.edu.co');
    });
  });

  it('delegates getById to the safe user projection', async () => {
    const { service, safeUsers } = setup();

    expect(await service.getById('u1')).toBe(AUTH_USER);
    expect(safeUsers.getById).toHaveBeenCalledWith('u1');
  });
});
