import * as bcrypt from 'bcryptjs';
import {
  pendingCode,
  setupIssuer as setup,
} from './verification-code-issuer.test-helpers';

const FIXED_CODE = '482913';

describe('VerificationCodeIssuerService with a fixed code', () => {
  it('stores the fixed code it is handed instead of a random one', async () => {
    const { service, table } = setup();

    const code = await service.issueIfAllowed('u1', FIXED_CODE);

    expect(code).toBe(FIXED_CODE);
    const stored = table.create.mock.calls[0][1].codeHash as string;
    expect(bcrypt.compareSync(FIXED_CODE, stored)).toBe(true);
  });

  it('holds the fixed code to the same resend policy', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(
      pendingCode({ createdAt: new Date() }),
    );

    expect(await service.issueIfAllowed('u1', FIXED_CODE)).toBeNull();
    expect(table.create).not.toHaveBeenCalled();
  });

  it('carries the spent attempts over, since a resend does not change the secret', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(pendingCode({ attempts: 3 }));

    await service.issueIfAllowed('u1', FIXED_CODE);

    expect(table.create.mock.calls[0][1].attempts).toBe(3);
  });

  it('starts over once the previous code has expired', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(
      pendingCode({ attempts: 5, expiresAt: new Date(Date.now() - 1000) }),
    );

    await service.issueIfAllowed('u1', FIXED_CODE);

    expect(table.create.mock.calls[0][1].attempts).toBe(0);
  });

  it('starts at zero when there is no previous code', async () => {
    const { service, table } = setup();

    await service.issueIfAllowed('u1', FIXED_CODE);

    expect(table.create.mock.calls[0][1].attempts).toBe(0);
  });
});
