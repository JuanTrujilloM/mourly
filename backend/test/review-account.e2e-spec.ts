import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Server } from 'http';
import { CODE_SENT_MESSAGE } from '../src/modules/auth/auth.messages';
import { VerificationDispatcherService } from '../src/modules/auth/verification-dispatcher.service';
import { MailService } from '../src/modules/mail/mail.service';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '../src/modules/universities/university-messages';
import { createTestApp, type TestApp } from './setup-app';

const REVIEW_EMAIL = 'revision@mourly.com';
const REVIEW_CODE = '482913';
const STUDENT_EMAIL = 'ana@eafit.edu.co';

describe('Review account entry (e2e)', () => {
  let context: TestApp;
  let mail: jest.SpyInstance;

  beforeAll(async () => {
    process.env.REVIEW_ACCOUNT_EMAIL = REVIEW_EMAIL;
    process.env.REVIEW_ACCOUNT_CODE = REVIEW_CODE;
    context = await createTestApp();
  });

  afterAll(async () => {
    delete process.env.REVIEW_ACCOUNT_EMAIL;
    delete process.env.REVIEW_ACCOUNT_CODE;
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REVIEW_ACCOUNT_EMAIL = REVIEW_EMAIL;
    mail = jest
      .spyOn(context.app.get(MailService), 'sendVerificationCode')
      .mockResolvedValue(undefined);
    context.prisma.user.upsert.mockResolvedValue({ id: 'u-review' });
    context.prisma.emailVerificationCode.findFirst.mockResolvedValue(null);
  });

  const server = () => context.app.getHttpServer() as Server;
  const requestCode = async (email: string, status: number) => {
    const response = await request(server())
      .post('/auth/request-code')
      .send({ email })
      .expect(status);
    await context.app.get(VerificationDispatcherService).drain();
    return response;
  };
  const storedCodeHash = () => {
    const [{ data }] = context.prisma.emailVerificationCode.create.mock
      .calls[0] as [{ data: { codeHash: string } }];
    return data.codeHash;
  };

  it('stores the fixed code, mails nothing and marks the account in its row', async () => {
    const response = await requestCode(REVIEW_EMAIL, 200);

    expect(response.body).toEqual({ message: CODE_SENT_MESSAGE });
    expect(bcrypt.compareSync(REVIEW_CODE, storedCodeHash())).toBe(true);
    expect(mail).not.toHaveBeenCalled();
    expect(context.prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: REVIEW_EMAIL },
      update: { isReviewAccount: true },
      create: { email: REVIEW_EMAIL, isReviewAccount: true },
    });
  });

  it('still turns away any other address on the same domain', async () => {
    const response = await requestCode('otro@mourly.com', 400);

    expect(response.body.message).toContain(UNSUPPORTED_UNIVERSITY_MESSAGE);
    expect(context.prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('ignores a review email on a university domain and mails a random code instead', async () => {
    process.env.REVIEW_ACCOUNT_EMAIL = STUDENT_EMAIL;

    await requestCode(STUDENT_EMAIL, 200);

    expect(bcrypt.compareSync(REVIEW_CODE, storedCodeHash())).toBe(false);
    expect(mail).toHaveBeenCalledWith(STUDENT_EMAIL, expect.any(String), 10);
    expect(context.prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: STUDENT_EMAIL },
      update: {},
      create: { email: STUDENT_EMAIL, isReviewAccount: false },
    });
  });
});
