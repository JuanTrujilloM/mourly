import { CELLPHONE, setupPhoneNumber } from './phone-number.test-helpers';

const REVIEW_EMAIL = 'revision@mourly.com';

const setup = (email: string, cellphone: string | null = null) =>
  setupPhoneNumber({
    current: { email, cellphone, cellphoneVerifiedAt: null },
  });

describe('PhoneNumberService.assign for the review account', () => {
  const originalEmail = process.env.REVIEW_ACCOUNT_EMAIL;
  const originalCode = process.env.REVIEW_ACCOUNT_CODE;

  function configure(email?: string, code?: string) {
    if (email === undefined) delete process.env.REVIEW_ACCOUNT_EMAIL;
    else process.env.REVIEW_ACCOUNT_EMAIL = email;
    if (code === undefined) delete process.env.REVIEW_ACCOUNT_CODE;
    else process.env.REVIEW_ACCOUNT_CODE = code;
  }

  beforeEach(() => configure(REVIEW_EMAIL, '482913'));
  afterEach(() => configure(originalEmail, originalCode));

  it('verifies the reviewer number without an SMS, since reviewers hold no Colombian line', async () => {
    const { service, prisma } = setup(REVIEW_EMAIL);

    expect(await service.assign('u1', '3001112233')).toEqual({
      cellphone: CELLPHONE,
      cellphoneVerified: true,
    });
    const call = prisma.user.update.mock.calls[0][0] as {
      data: { cellphoneVerifiedAt: Date };
    };
    expect(call.data.cellphoneVerifiedAt).toBeInstanceOf(Date);
  });

  it('verifies a number the reviewer saved before the account was configured', async () => {
    const { service, prisma } = setup(REVIEW_EMAIL, CELLPHONE);

    const result = await service.assign('u1', CELLPHONE);

    expect(result.cellphoneVerified).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('still asks every other account for the SMS', async () => {
    const { service } = setup('ana@eafit.edu.co');

    const result = await service.assign('u1', '3001112233');

    expect(result.cellphoneVerified).toBe(false);
  });

  it('asks the reviewer for the SMS once the account is switched off', async () => {
    configure();
    const { service } = setup(REVIEW_EMAIL);

    const result = await service.assign('u1', '3001112233');

    expect(result.cellphoneVerified).toBe(false);
  });

  it('still refuses a number another account verified', async () => {
    const { service, users } = setup(REVIEW_EMAIL);
    users.isCellphoneVerifiedByAnother.mockResolvedValue(true);

    await expect(service.assign('u1', CELLPHONE)).rejects.toThrow();
  });
});
