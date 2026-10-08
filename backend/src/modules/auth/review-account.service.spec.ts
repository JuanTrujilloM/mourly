import { Logger } from '@nestjs/common';
import { UniversitiesService } from '../universities/universities.service';
import { ReviewAccountService } from './review-account.service';

const REVIEW_EMAIL = 'revision@mourly.com';
const REVIEW_CODE = '482913';

function setup(university: unknown = null) {
  const universities = {
    findByEmail: jest.fn().mockResolvedValue(university),
  };
  const service = new ReviewAccountService(
    universities as unknown as UniversitiesService,
  );
  return { service, universities };
}

describe('ReviewAccountService', () => {
  beforeEach(() => {
    process.env.REVIEW_ACCOUNT_EMAIL = REVIEW_EMAIL;
    process.env.REVIEW_ACCOUNT_CODE = REVIEW_CODE;
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete process.env.REVIEW_ACCOUNT_EMAIL;
    delete process.env.REVIEW_ACCOUNT_CODE;
    jest.restoreAllMocks();
  });

  it('hands the fixed code to the configured address', async () => {
    const { service } = setup();

    expect(await service.fixedCodeFor(REVIEW_EMAIL)).toBe(REVIEW_CODE);
    expect(await service.isReviewAccount(REVIEW_EMAIL)).toBe(true);
  });

  it('hands nothing to any other address without asking the database', async () => {
    const { service, universities } = setup();

    expect(await service.fixedCodeFor('ana@eafit.edu.co')).toBeNull();
    expect(await service.isReviewAccount('ana@eafit.edu.co')).toBe(false);
    expect(universities.findByEmail).not.toHaveBeenCalled();
  });

  it('refuses a university address, so the code never opens a student account', async () => {
    process.env.REVIEW_ACCOUNT_EMAIL = 'ana@eafit.edu.co';
    const { service } = setup({ domain: 'eafit.edu.co', active: true });

    expect(await service.fixedCodeFor('ana@eafit.edu.co')).toBeNull();
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  it('refuses a domain even while its university is inactive', async () => {
    process.env.REVIEW_ACCOUNT_EMAIL = 'ana@javeriana.edu.co';
    const { service } = setup({ domain: 'javeriana.edu.co', active: false });

    expect(await service.isReviewAccount('ana@javeriana.edu.co')).toBe(false);
  });
});
