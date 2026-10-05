import {
  isReviewEmail,
  reviewAccountEmail,
  reviewCodeFor,
} from './review-account';

describe('review account', () => {
  const originalEmail = process.env.REVIEW_ACCOUNT_EMAIL;
  const originalCode = process.env.REVIEW_ACCOUNT_CODE;

  afterEach(() => {
    process.env.REVIEW_ACCOUNT_EMAIL = originalEmail;
    process.env.REVIEW_ACCOUNT_CODE = originalCode;
  });

  function configure(email?: string, code?: string) {
    if (email === undefined) delete process.env.REVIEW_ACCOUNT_EMAIL;
    else process.env.REVIEW_ACCOUNT_EMAIL = email;
    if (code === undefined) delete process.env.REVIEW_ACCOUNT_CODE;
    else process.env.REVIEW_ACCOUNT_CODE = code;
  }

  it('is off when nothing is configured', () => {
    configure();

    expect(reviewAccountEmail()).toBeNull();
    expect(isReviewEmail('revision@mourly.com')).toBe(false);
    expect(reviewCodeFor('revision@mourly.com')).toBeNull();
  });

  it('is off when the email is set without a code', () => {
    configure('revision@mourly.com');

    expect(reviewAccountEmail()).toBeNull();
    expect(isReviewEmail('revision@mourly.com')).toBe(false);
  });

  it('is off when the code is not six digits, since the app only accepts six', () => {
    configure('revision@mourly.com', '4829');

    expect(reviewAccountEmail()).toBeNull();
    expect(reviewCodeFor('revision@mourly.com')).toBeNull();
  });

  it('hands the fixed code to the configured email regardless of case and spacing', () => {
    configure(' Revision@Mourly.com ', ' 482913 ');

    expect(reviewAccountEmail()).toBe('revision@mourly.com');
    expect(isReviewEmail('REVISION@mourly.com ')).toBe(true);
    expect(reviewCodeFor('revision@mourly.com')).toBe('482913');
  });

  it('gives no code to any other email', () => {
    configure('revision@mourly.com', '482913');

    expect(isReviewEmail('ana@eafit.edu.co')).toBe(false);
    expect(reviewCodeFor('ana@eafit.edu.co')).toBeNull();
  });
});
